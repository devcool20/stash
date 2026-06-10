import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import fs from 'fs';


dotenv.config();

const app = express();
const PORT = 3000;

// Enable CORS for frontend clients (e.g. deployed on Vercel)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Body parsing configurations
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Set up uploads directory for image hosting
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

let hasApiKey = !!process.env.GROQ_API_KEY;
if (hasApiKey) {
  console.log('Groq API key found — cloud vision OCR enabled (Llama 4 Scout).');
} else {
  console.warn('GROQ_API_KEY not set. OCR will return mock responses.');
}

if (process.env.GEMINI_API_KEY) {
  console.log('Gemini API key found — celebrity identification via Gemini enabled.');
} else {
  console.warn('GEMINI_API_KEY not set. Gemini integration disabled.');
}

// 1. API Endpoint: Metadata Hydration Parser
// Proxies fetches for target URLs to retrieve OpenGraph tags, bypassing client CORS restrictions
app.get('/api/metadata', async (req, res) => {
  const targetUrlStr = req.query.url as string;
  if (!targetUrlStr) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    let resolvedUrl = targetUrlStr;
    if (!/^https?:\/\//i.test(resolvedUrl)) {
      resolvedUrl = 'https://' + resolvedUrl;
    }

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 6000); // 6s timeout

    const fetchResponse = await fetch(resolvedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
      },
      signal: abortController.signal
    });

    clearTimeout(timeoutId);

    if (!fetchResponse.ok) {
      throw new Error(`HTTP fetch failed with status ${fetchResponse.status}`);
    }

    const html = await fetchResponse.text();
    
    // Extractor regex selectors (resilient to raw text)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i) || 
                         html.match(/<meta\s+name=["']og:title["']\s+content=["']([^"']*)["']/i);
    const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']*)["']/i) ||
                        html.match(/<meta\s+name=["']og:description["']\s+content=["']([^"']*)["']/i) ||
                        html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
    const ogImgMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i) ||
                       html.match(/<meta\s+name=["']og:image["']\s+content=["']([^"']*)["']/i);

    const title = (ogTitleMatch ? ogTitleMatch[1] : (titleMatch ? titleMatch[1] : '')).trim();
    const description = (ogDescMatch ? ogDescMatch[1] : '').trim();
    const imageUrl = (ogImgMatch ? ogImgMatch[1] : '').trim();
    
    // Resolve favicon
    let favicon = '';
    try {
      const parsedUrl = new URL(resolvedUrl);
      favicon = `${parsedUrl.origin}/favicon.ico`;
    } catch (_) {
      favicon = '';
    }

    return res.json({
      title: title || 'Stashed Website Note',
      description: description || 'Gathered clippings and web nodes.',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
      sourceUrl: resolvedUrl,
      favicon
    });

  } catch (err: any) {
    console.error(`Metadata fetching failed for ${targetUrlStr}:`, err.message);
    
    // Dynamic beautiful fallback if scraping fails (returns high fidelity domain placeholder info)
    let domain = 'stashed-node.net';
    try {
      const parsed = new URL(targetUrlStr.startsWith('http') ? targetUrlStr : 'https://' + targetUrlStr);
      domain = parsed.hostname;
    } catch (_) {}

    return res.json({
      title: domain.replace('www.', '').split('.')[0].toUpperCase() + ' Link Note',
      description: `Ingested content connection to ${domain}. Metadata parsed locally on offline fallback.`,
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
      sourceUrl: targetUrlStr,
      favicon: `https://www.google.com/s2/favicons?sz=64&domain=${domain}`
    });
  }
});
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

async function searchWeb(query: string): Promise<string> {
  try {
    const res = await fetchWithTimeout(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
      },
      timeout: 5000
    });
    if (!res.ok) return '';
    const html = await res.text();
    const matches = html.matchAll(/<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g);
    const snippets: string[] = [];
    for (const match of matches) {
      const cleanSnippet = decodeHtmlEntities(match[1].replace(/<[^>]*>/g, '').trim());
      snippets.push(cleanSnippet);
      if (snippets.length >= 4) break;
    }
    return snippets.join('\n\n');
  } catch (err) {
    console.error('Web search failed:', err);
    return '';
  }
}

async function fetchWithTimeout(url: string, options: RequestInit & { timeout?: number }): Promise<Response> {
  const { timeout = 8000, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...rest,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function callGeminiApi(prompt: string, base64Data: string, mimeType: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set.');
  }

  const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType || 'image/png',
                data: cleanBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    }),
    timeout: 10000
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const contentText = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!contentText) {
    throw new Error(`Empty content returned from Gemini REST API.`);
  }

  return contentText;
}

// 2. API Endpoint: Vision OCR & Image Analysis
// Uses Groq's Llama 4 Scout Vision API to extract OCR text,
// generate a one-line visual summary for search, and classify content.
app.post('/api/ocr', async (req, res) => {
  console.log('\n--- [/api/ocr] Received image processing request ---');
  const { base64, mimeType } = req.body;
  if (!base64) {
    console.error('[/api/ocr] Error: Missing base64 data payload');
    return res.status(400).json({ error: 'Missing base64 data payload' });
  }

  const cleanMimeType = mimeType || 'image/png';
  const apiKey = process.env.GROQ_API_KEY;

  // Save base64 image locally to be served statically
  let hostedImageUrl = '';
  try {
    const rawBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
    const filename = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, rawBase64, 'base64');
    
    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    hostedImageUrl = `${protocol}://${host}/uploads/${filename}`;
    console.log(`[/api/ocr] Saved image locally. Public hosted URL: ${hostedImageUrl}`);
  } catch (uploadErr) {
    console.error('[/api/ocr] Failed to save uploaded image locally:', uploadErr);
  }

  if (!apiKey) {
    console.log('[/api/ocr] Warning: GROQ_API_KEY is not set in environment. Using fallback mock response.');
    const mockOCRResponses = [
      {
        text: 'AUTHENTIC PREMIUM LOOKS FOR MEN & WOMEN\nDESIGNED IN BALENCIAGA PARIS STUDS\nPRICE: €1200.00\nSIZE: EXTRA LARGE\nPOSTED: 3 HOURS AGO\nTAGS: #FASHION #DESIGN',
        title: 'Balenciaga Studio Preview',
        summary: 'A product page for Balenciaga studded fashion items for men and women.',
        description: 'Product listing page showing Balenciaga Paris studs for men and women.',
        category: 'Shopping',
        tags: ['fashion', 'balenciaga', 'design'],
        imageUrl: hostedImageUrl
      },
      {
        text: 'INGREDIENTS LIST:\n- 4 ORGANIC EGGS\n- 1 CUP UNSTABILIZED HOLLANDAISE\n- CHIVES & CURED DUCK THIGHS\n- WILD SOURDOUGH LOAF\nBON APPETIT MAG.',
        title: 'Sunday Brunch Benedict Recipe',
        summary: 'A recipe card for eggs benedict with hollandaise and duck confit.',
        description: 'Ingredients card for a slow Sunday brunch showing eggs benedict on sourdough.',
        category: 'Recipes',
        tags: ['brunch', 'recipe', 'cooking'],
        imageUrl: hostedImageUrl
      },
      {
        text: 'SOMA STRETCH ARMCHAIR OAKEN WOODS\nMATERIAL: BOUCHÉ TEXTURED\nDESIGNER ID: WEGNER-284\nRETAIL: $4,250',
        title: 'Soma Oak Chair Specs',
        summary: 'A spec sheet for a Soma oaken armchair with bouché fabric.',
        description: 'Spec sheet for a Soma oaken stretch armchair with bouché fabric.',
        category: 'Design',
        tags: ['furniture', 'interior', 'designer'],
        imageUrl: hostedImageUrl
      },
      {
        text: 'FLUID CYAN GRADIENTS STUDIES MAPPED\nSPLINE SHADER S3D - COMPOSITING\nREACTION RATIO: 16MS\nCREATED AT DEV-STASH LABS',
        title: 'Cyan Fluid Spline compositing',
        summary: 'A 3D gradient shader study rendered in Spline.',
        description: 'Gradients visual study render with Spline 3D compositing shaders.',
        category: 'Design',
        tags: ['compositing', 'spline', 'shader'],
        imageUrl: hostedImageUrl
      }
    ];
    const randomIndex = Math.floor(Math.random() * mockOCRResponses.length);
    console.log('[/api/ocr] Returned mock response:', mockOCRResponses[randomIndex].title);
    return res.json(mockOCRResponses[randomIndex]);
  }

  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

  // Fast single-pass pipeline using Gemini 2.0 Flash if available
  if (process.env.GEMINI_API_KEY) {
    console.log('[/api/ocr] Gemini API key found. Running fast, single-pass gemini-2.0-flash pipeline...');
    try {
      const geminiPrompt = `Analyze this image in detail. Identify any prominent subjects, including specific products (brand/model), locations (landmarks), text content, or people (especially celebrities/public figures like Shah Rukh Khan, Rohit Shetty, etc. if recognizable).
If the image is a selfie, mirror selfie, or shows a non-celebrity person, focus the analysis on identifying key objects visible in the image such as the phone (brand/model if possible), mirrors, shoes, t-shirts/clothing, bags, accessories, or other objects, rather than returning generic descriptions of the person. Include these objects in the description, title, and tags.

Return a JSON object with these fields:
- "text": extract ALL visible text in the image (especially names, titles, headings, prices, specifications, and paragraph text). Do not skip any text.
- "title": a short descriptive title (max 6 words). Use exact names/versions/brands/celebrities if recognizable. Otherwise, use key objects/setting (e.g., "Mirror Selfie with Phone").
- "summary": ONE short sentence describing what this image visually shows.
- "description": a detailed 3-4 sentence description of what is pictured. Include exact names, model numbers, locations, or celebrity identities if recognizable. For selfies/mirror selfies, describe their outfit, setting, and key objects they have (phone, bag, shoes, etc.).
- "category": classify this image into one of "Shopping", "Recipes", "Travel", "Articles", "Design". If the image contains a human face, portrait, avatar, or people, classify it as "People". If it is another type of image that doesn't fit the main five, output a custom category (e.g. "Pets", "Fitness", "Work"). Be robust and accurate.
- "tags": 3-5 single-word tags describing the image content. Include key objects if appropriate (e.g., "phone", "mirror", "shoes", "outfit", "tshirt").

Return ONLY valid JSON.`;

      const rawContent = await callGeminiApi(geminiPrompt, base64, cleanMimeType);
      console.log('[/api/ocr] Received response from Gemini. Raw content:\n', rawContent);

      if (!rawContent) {
        throw new Error('Empty response from Gemini.');
      }

      const jsonText = rawContent.trim();
      let parsed;
      try {
        const firstBrace = jsonText.indexOf('{');
        const lastBrace = jsonText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const jsonContent = jsonText.substring(firstBrace, lastBrace + 1);
          parsed = JSON.parse(jsonContent);
        } else {
          const cleaned = jsonText.replace(/^```(?:json)?\s*|```\s*$/gi, '').trim();
          parsed = JSON.parse(cleaned);
        }
      } catch (parseErr) {
        console.error('[/api/ocr] Error parsing JSON from Gemini response:', parseErr);
        throw parseErr;
      }

      console.log('[/api/ocr] Successfully parsed JSON result from Gemini. Title:', parsed.title);
      return res.json({
        text: parsed.text || '',
        title: parsed.title || 'Analyzed Image',
        summary: parsed.summary || '',
        description: parsed.description || 'Extracted from image.',
        category: parsed.category || 'Design',
        tags: parsed.tags || [],
        imageUrl: hostedImageUrl
      });

    } catch (err: any) {
      console.error('[/api/ocr] Gemini pipeline failed, falling back to Groq/Llama pipeline:', err?.message || err);
    }
  }

  // Step 1: Classify subject type AND generate search query
  let searchResults = '';
  let subjectType = 'unknown'; // 'person', 'product', 'location', 'other'
  try {
    const rawBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
    const classifyRequestBody = {
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${cleanMimeType};base64,${rawBase64}` }
            },
            {
              type: 'text',
              text: `Classify the main subject of this image AND generate a web search query in JSON format.

1. "type": one of "person", "product", "location", "text_content", "other"
   - "person" = human face, portrait, celebrity, selfie
   - "product" = shoes, phone, watch, clothing, gadget, furniture
   - "location" = building, landmark, scenery, travel destination
   - "text_content" = screenshot, article, recipe card, document
   - "other" = anything else
2. "query": a 2-5 word search query to find details about this subject
   - For products: include brand and model (e.g. "Nike Air Force 1", "iPhone 15 Pro")
   - For locations: include place name (e.g. "Eiffel Tower Paris")
   - For text/articles: extract the main heading or title
   - For people: if they are a celebrity, public figure, actor, or well-known person, you MUST output their name as the query (e.g. "Shah Rukh Khan", "Rohit Shetty", "Mammootty"). If they are a regular person, a selfie, a mirror selfie, or not famous, just output "person".

Return ONLY a valid JSON object: {"type": "...", "query": "..."}`
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 80,
      temperature: 0.1
    };

    console.log('[/api/ocr] Running Step 1: Subject Classification + Query Generation...');
    const queryApiRes = await fetchWithTimeout(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(classifyRequestBody),
      timeout: 6000
    });

    if (queryApiRes.ok) {
      const queryData = await queryApiRes.json();
      const rawQueryContent = queryData?.choices?.[0]?.message?.content?.trim() || '';
      console.log('[/api/ocr] Step 1 Raw Output:', rawQueryContent);
      
      let parsedQueryObj: any = {};
      try {
        const firstBrace = rawQueryContent.indexOf('{');
        const lastBrace = rawQueryContent.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          parsedQueryObj = JSON.parse(rawQueryContent.substring(firstBrace, lastBrace + 1));
        }
      } catch (e) {
        console.warn('[/api/ocr] Failed to parse classification JSON');
      }

      subjectType = parsedQueryObj.type || 'unknown';
      const visualQuery = parsedQueryObj.query || '';
      console.log(`[/api/ocr] Detected subject type: "${subjectType}"`);

      // Only do web search for non-person subjects or recognized celebrities
      if (visualQuery && visualQuery !== 'person') {
        console.log(`[/api/ocr] Step 2: Searching DuckDuckGo for: "${visualQuery}"`);
        searchResults = await searchWeb(visualQuery);
        console.log('[/api/ocr] Search Results Retrieved:\n', searchResults);
      } else {
        console.log('[/api/ocr] Step 2: SKIPPED web search (generic person or no query)');
      }
    }
  } catch (err) {
    console.error('[/api/ocr] Classification pipeline failed:', err);
  }

  // Step 3: Final Analysis
  // For people: direct analysis without search contamination (proven to work better)
  // For products/locations: grounded synthesis with search results
  try {
    const rawBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
    console.log(`[/api/ocr] Image base64 payload size: ${(rawBase64.length / 1024).toFixed(1)} KB`);

    if (subjectType === 'person' && process.env.GEMINI_API_KEY) {
      console.log('[/api/ocr] Subject is "person" and Gemini is enabled. Using gemini-2.0-flash...');
      try {
        const geminiPrompt = `Analyze this image in detail. Identify the main person in the image (especially if they are a celebrity or public figure like Shah Rukh Khan, Rohit Shetty, etc.).
If the person is not a famous or recognizable public figure (e.g., a regular person, selfie, or mirror selfie), do NOT guess their name; instead, focus the analysis and description on key objects visible in the image, such as their phone (brand/model if possible), mirrors, shoes, t-shirts/clothing, bags, accessories, or other items they are carrying or wearing.

Return a JSON object with these fields:
- "text": extract ALL visible text in the image (especially names, titles, headings, prices, specifications, and paragraph text). Do not skip any text.
- "title": a short descriptive title (max 6 words). If a specific person is identified, use their name. If not, use key objects or setting (e.g., "Mirror Selfie with Phone").
- "summary": ONE short sentence describing what this image visually shows.
- "description": a detailed 3-4 sentence description of what is pictured. Identify the person by name if celebrity, otherwise describe their outfit, setting, and key objects they have (phone, bag, shoes, etc.).
- "category": Always classify as "People".
- "tags": 3-5 single-word tags describing the image content (e.g. including key objects like "phone", "mirror", "shoes", "outfit", "tshirt").

Return ONLY valid JSON.`;

        const rawContent = await callGeminiApi(geminiPrompt, base64, cleanMimeType);
        console.log('[/api/ocr] Received response from Gemini. Raw content:\n', rawContent);

        if (!rawContent) {
          throw new Error('Empty message response from Gemini.');
        }

      const jsonText = rawContent.trim();
      let parsed;
      try {
        const firstBrace = jsonText.indexOf('{');
        const lastBrace = jsonText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const jsonContent = jsonText.substring(firstBrace, lastBrace + 1);
          parsed = JSON.parse(jsonContent);
        } else {
          const cleaned = jsonText.replace(/^```(?:json)?\s*|```\s*$/gi, '').trim();
          parsed = JSON.parse(cleaned);
        }
      } catch (parseErr) {
        console.error('[/api/ocr] Error parsing JSON from Gemini response:', parseErr);
        throw parseErr;
      }

        console.log('[/api/ocr] Successfully parsed JSON result from Gemini. Title:', parsed.title);
        return res.json({
          text: parsed.text || '',
          title: parsed.title || 'Analyzed Image',
          summary: parsed.summary || '',
          description: parsed.description || 'Extracted from image.',
          category: parsed.category || 'People',
          tags: parsed.tags || [],
          imageUrl: hostedImageUrl
        });
      } catch (geminiErr: any) {
        console.error('[/api/ocr] Direct Gemini call failed for person subject:', geminiErr?.message || geminiErr);
        // Fall back to Groq Llama completions below (do not return, let it continue)
      }
    }

    console.log('[/api/ocr] GROQ_API_KEY is active. Preparing request for meta-llama/llama-4-scout-17b-16e-instruct...');
    // Use different prompts based on whether we have search results
    const promptText = searchResults
      ? `Analyze this image in detail. Synthesize it with these web search results to provide exact, real-world, grounded details about the subject (avoid generic descriptions, name specific people/models/locations):
${`[WEB SEARCH RESULTS]:\n${searchResults}\n`}

Return a JSON object with these fields:
- "text": extract ALL visible text in the image (especially names, titles, headings, prices, specifications, and paragraph text). Do not skip any text.
- "title": a short descriptive title (max 6 words). Ensure it uses the exact names/versions from the search results if available.
- "summary": ONE short sentence describing what this image visually shows.
- "description": a detailed 3-4 sentence description of what is pictured. Include exact names, model numbers, locations, and specifications found in the search results.
- "category": classify this image into one of "Shopping", "Recipes", "Travel", "Articles", "Design". If the image contains a human face, portrait, avatar, or people, classify it as "People". If it is another type of image that doesn't fit the main five, output a custom category (e.g. "Pets", "Fitness", "Work"). Be robust and accurate.
- "tags": 3-5 single-word tags describing the image content.

Return ONLY valid JSON.`
      : `Analyze this image in detail. Return a JSON object with these fields:
- "text": extract ALL visible text in the image (especially names, titles, headings, prices, specifications, and paragraph text). Do not skip any text.
- "title": a short descriptive title (max 6 words).
- "summary": ONE short sentence describing what this image visually shows.
- "description": a detailed 3-4 sentence description of what is pictured. If it is a person, try to identify who they are based on recognizable features. Describe their appearance, clothing, setting, and any other details.
- "category": classify this image into one of "Shopping", "Recipes", "Travel", "Articles", "Design". If the image contains a human face, portrait, avatar, or people, classify it as "People". If it is another type of image that doesn't fit the main five, output a custom category (e.g. "Pets", "Fitness", "Work"). Be robust and accurate.
- "tags": 3-5 single-word tags describing the image content.

Return ONLY valid JSON.`;

    const requestBody = {
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${cleanMimeType};base64,${rawBase64}` }
            },
            {
              type: 'text',
              text: promptText
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
      temperature: 0.1
    };

    console.log('[/api/ocr] Dispatching fetch request to Groq API completions endpoint...');
    const apiRes = await fetchWithTimeout(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      timeout: 12000
    });

    if (!apiRes.ok) {
      const errBody = await apiRes.text();
      console.error('[/api/ocr] Groq API returned failure status:', apiRes.status, errBody);
      return res.status(502).json({
        error: 'Cloud vision model is currently unavailable. Try again later.'
      });
    }

    const data = await apiRes.json();
    const raw = data?.choices?.[0]?.message?.content;
    console.log('[/api/ocr] Received response from Groq. Raw content:\n', raw);

    if (!raw) {
      console.error('[/api/ocr] Error: Groq returned response choices with empty message content.');
      return res.status(502).json({ error: 'Empty message response from Groq.' });
    }

    const jsonText = raw.trim();
    let parsed;

    try {
      // Robust JSON extraction using brace matching
      const firstBrace = jsonText.indexOf('{');
      const lastBrace = jsonText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonContent = jsonText.substring(firstBrace, lastBrace + 1);
        parsed = JSON.parse(jsonContent);
      } else {
        const cleaned = jsonText.replace(/^```(?:json)?\s*|```\s*$/gi, '').trim();
        parsed = JSON.parse(cleaned);
      }
    } catch (parseErr) {
      console.error('[/api/ocr] Error parsing JSON from Groq response:', parseErr);
      console.error('[/api/ocr] JSON parse target string was:', jsonText);
      return res.status(502).json({ error: 'Failed to parse JSON response from vision model.' });
    }

    console.log('[/api/ocr] Successfully parsed JSON result. Title:', parsed.title);
    return res.json({
      text: parsed.text || '',
      title: parsed.title || 'Analyzed Image',
      summary: parsed.summary || '',
      description: parsed.description || 'Extracted from image.',
      category: parsed.category || 'Design',
      tags: parsed.tags || [],
      imageUrl: hostedImageUrl
    });

  } catch (err: any) {
    console.error('[/api/ocr] OCR pipeline catch-block error:', err);
    return res.status(502).json({
      error: 'Cloud vision model failed processing. Try again later.'
    });
  }
});

app.post('/api/upload', (req, res) => {
  const { base64, mimeType } = req.body;
  if (!base64) {
    return res.status(400).json({ error: 'Missing base64 data' });
  }
  try {
    const rawBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
    const filename = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, rawBase64, 'base64');
    
    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const hostedImageUrl = `${protocol}://${host}/uploads/${filename}`;
    console.log(`[/api/upload] Saved uploaded image locally. Public hosted URL: ${hostedImageUrl}`);
    res.json({ imageUrl: hostedImageUrl });
  } catch (err) {
    console.error('[/api/upload] Failed to save uploaded image:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// 3. API Endpoints: Stash Database
const DB_FILE = path.join(process.cwd(), 'stash_db.json');

const DEFAULT_ITEMS = [
  {
    id: 'item-1',
    type: 'image',
    title: 'Linen Set',
    description: 'Minimal aesthetic lookbook apparel collection',
    imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=600',
    category: 'Shopping',
    extractedText: 'STUDIO PREVIEW - 100% Giza Cotton Linen Shirt White with Relaxed Slate Utility Jeans. Fitted for autumn collections. Brand: SÉZANE.',
    status: 'ready',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'item-2',
    type: 'image',
    title: 'Runner V2',
    description: 'Suede and full-grain leather premium active athletic sneakers',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600',
    category: 'Shopping',
    extractedText: 'STASH LABS INC. RUNNER V2. BEIGE CORAL OUTSOLE AND TEXTURED TPU ENCAPSULATION MIDSOLE. SIZES 8-12.',
    status: 'ready',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'item-3',
    type: 'image',
    title: 'Gold Watch',
    description: 'Gold-plated luxury watch classic vintage collectors edition',
    imageUrl: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=600',
    category: 'Shopping',
    extractedText: 'BOSS HUGO BOSS. CHRONOGRAPH LIMITED SELECTIONS CALIBRE 12. WATER RESISTANT 50M.',
    status: 'ready',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'item-4',
    type: 'image',
    title: 'Oak Chair',
    description: 'Minimal warm scandinavian lounge armchair styling design',
    imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=600',
    category: 'Design',
    extractedText: 'OAK SOLID BODY WITH BOUCHÉ WOVEN LINING. RETRO ACCENTS FROM THE 1970S DESIGN INSPIRED BY WEGNER.',
    status: 'ready',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'item-5',
    type: 'image',
    title: 'Editorial Looks',
    description: 'High-contrast studio autumn designer collection',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600',
    category: 'Design',
    extractedText: 'BALENCIAGA PARIS WINTER SELECTIONS. BURGUNDY VELVET OVERCOAT WITH METALLIC ACCESSORY LOOPS.',
    status: 'ready',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  },
  {
    id: 'item-6',
    type: 'link',
    title: 'Slow Sunday Brunch',
    description: 'Artisanal eggs benedict paired with wild-fermented yeast sourdough',
    imageUrl: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80&w=600',
    sourceUrl: 'https://bonappetit.com/recipe',
    category: 'Recipes',
    extractedText: 'Slow Sunday Brunch: 4 organic soft poached eggs, cured duck breasts, chives, dynamic lemon hollandaise sauce.',
    status: 'ready',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'item-7',
    type: 'link',
    title: '3D Gradient Studies',
    description: 'Stellar color mesh and dark translucent glassmorphism explorations',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
    sourceUrl: 'https://dribbble.com/shots',
    category: 'Design',
    extractedText: 'CYAN PURPLE FLUID CONTOURS MAPPED IN THREE-DIMENSIONAL SPLINE SPACE WITH FROSTED DISK ACCENTS.',
    status: 'ready',
    createdAt: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString()
  },
  {
    id: 'item-8',
    type: 'image',
    title: 'Trip Wishlist',
    description: 'Misty multi-layered peak textures in Mount Fuji scenic areas',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600',
    category: 'Travel',
    sourceUrl: 'https://airbnb.com/japan-stay',
    extractedText: 'HAKONE ONSEN RETREATS - FIRST FLOOR SCENERY CARD WITH HEATED SPRING DETAILS AND BALCONY VIEWS.',
    status: 'ready',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'item-9',
    type: 'image',
    title: 'Grail Drops',
    description: 'Retro limited run athletic high-tops',
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600',
    category: 'Shopping',
    extractedText: 'NIKE AIR FORCE 1 VINTAGE COLLECTORS HIGHER MIDSOLE CONTOURS. BLACK STRAP AT THE UPPER FOOTBED.',
    status: 'ready',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  {
    id: 'item-10',
    type: 'link',
    title: 'Cryptographic Sovereignty',
    description: 'Why localized secure hardware enclaves beats remote multi-tenant clouds.',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=600',
    sourceUrl: 'https://notion.so/architecture/sovereign-vault',
    category: 'Articles',
    extractedText: 'THE CRYPTOGRAPHIC HARDWARE BOUNDS: AES-256 PRIVATE SECURE ENVELOPE SEEDS ARE LOCKED DOWN ON-CHIP FOR HIGH SOVEREIGN METRICS.',
    status: 'ready',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

let dbItems: any[] = [];

function loadDb() {
  const placeholder = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600';
  if (fs.existsSync(DB_FILE)) {
    try {
      dbItems = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      console.log(`[Database] Loaded ${dbItems.length} items from ${DB_FILE}`);
      
      let cleaned = false;
      dbItems.forEach(item => {
        if (item.imageUrl && item.imageUrl.startsWith('file://')) {
          item.imageUrl = placeholder;
          cleaned = true;
        }
      });
      if (cleaned) {
        console.log('[Database] Auto-cleaned residual file:// URLs from database.');
        saveDb();
      }
    } catch (e) {
      dbItems = [...DEFAULT_ITEMS];
      saveDb();
    }
  } else {
    dbItems = [...DEFAULT_ITEMS];
    saveDb();
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbItems, null, 2), 'utf-8');
    console.log(`[Database] Saved ${dbItems.length} items to ${DB_FILE}`);
  } catch (e) {
    console.error('[Database] Failed to save database:', e);
  }
}

loadDb();

// DB API Endpoints
app.get('/api/items', (req, res) => {
  const userId = req.query.user_id as string || null;
  const filtered = dbItems.filter(item => {
    if (userId) {
      return item.user_id === userId;
    }
    return !item.user_id;
  });
  res.json(filtered);
});

app.post('/api/items', (req, res) => {
  const userId = req.query.user_id as string || req.body.user_id || null;
  const newItem = {
    id: req.body.id || `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    user_id: userId,
    type: req.body.type,
    title: req.body.title,
    description: req.body.description || '',
    imageUrl: req.body.imageUrl || '',
    sourceUrl: req.body.sourceUrl || '',
    favicon: req.body.favicon || '',
    category: req.body.category || 'Design',
    extractedText: req.body.extractedText || '',
    summary: req.body.summary || '',
    status: req.body.status || 'pending',
    createdAt: req.body.createdAt || new Date().toISOString()
  };
  dbItems.unshift(newItem);
  saveDb();
  console.log(`[/api/items] Created item: "${newItem.title}" (${newItem.id}) for user: ${userId}`);
  res.json(newItem);
});

app.put('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const userId = req.query.user_id as string || req.body.user_id || null;
  const idx = dbItems.findIndex(item => item.id === id && (userId ? item.user_id === userId : !item.user_id));
  if (idx === -1) {
    return res.status(404).json({ error: 'Item not found or unauthorized' });
  }
  dbItems[idx] = {
    ...dbItems[idx],
    ...req.body,
    user_id: userId
  };
  saveDb();
  console.log(`[/api/items] Updated item: "${dbItems[idx].title}" (${id})`);
  res.json(dbItems[idx]);
});

app.delete('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const userId = req.query.user_id as string || null;
  const initialLen = dbItems.length;
  dbItems = dbItems.filter(item => !(item.id === id && (userId ? item.user_id === userId : !item.user_id)));
  if (dbItems.length < initialLen) {
    saveDb();
    console.log(`[/api/items] Deleted item: ${id}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Item not found or unauthorized' });
  }
});

app.post('/api/items/reset', (req, res) => {
  const userId = req.query.user_id as string || null;
  if (userId) {
    dbItems = dbItems.filter(item => item.user_id !== userId);
  } else {
    dbItems = dbItems.filter(item => !!item.user_id);
    dbItems = [...dbItems, ...DEFAULT_ITEMS];
  }
  saveDb();
  console.log(`[/api/items/reset] Reset database for user: ${userId}.`);
  res.json({ success: true });
});

// Configure Vite middleware in development, and serve static assets in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted over Express development webserver.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Static asset routes serving from local /dist production folder.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`STASH FULL-Stack Node Server is now listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
