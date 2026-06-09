import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { autoCategorize } from './categories';

interface ProcessedResult {
  title: string;
  description: string;
  summary: string;
  extractedText: string;
  category: string;
  imageUrl?: string;
}

let cachedApiUrl: string | null = null;

export const resolveApiUrl = async (): Promise<string> => {
  if (cachedApiUrl) return cachedApiUrl;

  const candidates: string[] = [];
  if (__DEV__) {
    const manifest = Constants.expoConfig || (Constants as any).manifest || {};
    const debuggerHost = manifest.hostUri;
    if (debuggerHost) {
      const ip = debuggerHost.split(':')[0];
      if (ip !== 'localhost' && ip !== '127.0.0.1') {
        candidates.push(`http://${ip}:3000`);
      }
    }
    if (Platform.OS === 'android') {
      candidates.push('http://10.0.2.2:3000');
    }
    candidates.push('http://localhost:3000');
  }
  candidates.push(process.env.EXPO_PUBLIC_API_URL || 'https://stash-3qi7.onrender.com');

  console.log(`[resolveApiUrl] Probing candidate API endpoints:`, candidates);

  for (const url of candidates) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1200); // 1.2s probe timeout
      const res = await fetch(`${url}/api/metadata?url=localhost`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        console.log(`[resolveApiUrl] Successfully connected to API: ${url}`);
        cachedApiUrl = url;
        return url;
      }
    } catch {
      // Silent catch to try the next candidate
    }
  }

  // Fallback to the first candidate if none responded
  cachedApiUrl = candidates[0];
  console.warn(`[resolveApiUrl] No local candidates responded. Defaulting to: ${cachedApiUrl}`);
  return cachedApiUrl;
};

async function callOcrApi(base64: string): Promise<ProcessedResult | null> {
  const apiUrl = await resolveApiUrl();
  console.log(`[callOcrApi] Initiating call to: ${apiUrl}/api/ocr`);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      console.warn(`[callOcrApi] Request to ${apiUrl}/api/ocr timed out (10s limit reached)`);
      controller.abort();
    }, 10000);

    const res = await fetch(`${apiUrl}/api/ocr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64, mimeType: 'image/png' }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[callOcrApi] Server responded with status ${res.status}: ${res.statusText}`);
      try {
        const errBody = await res.text();
        console.warn(`[callOcrApi] Server error body:`, errBody);
      } catch {}
      return null;
    }

    const data = await res.json();
    if (!data) {
      console.warn(`[callOcrApi] Server returned empty or invalid JSON response`);
      return null;
    }

    console.log(`[callOcrApi] Successfully processed vision data. Title: "${data.title}", Category: "${data.category}"`);
    return {
      title: data.title || 'Extracted Screenshot',
      description: data.description || data.summary || 'Processed via Stash OCR engine',
      summary: data.summary || '',
      extractedText: data.text || '',
      category: data.category || 'Design',
      imageUrl: data.imageUrl || undefined,
    };
  } catch (err: any) {
    console.error(`[callOcrApi] Exception caught during API call to ${apiUrl}/api/ocr:`, err?.message || err);
    return null;
  }
}

function fallbackProcessing(uri: string, fileName?: string): ProcessedResult {
  const name = (fileName || uri.split('/').pop() || 'capture')
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]/g, ' ');
  const title = name.charAt(0).toUpperCase() + name.slice(1);
  const category = autoCategorize(title, title);
  return {
    title,
    description: `Captured • ${new Date().toLocaleDateString()}`,
    summary: `${title} image captured`,
    extractedText: `Imported from ${fileName || uri.split('/').pop() || 'gallery'}`,
    category,
  };
}

export async function processImage(
  uri: string,
  fileName?: string,
): Promise<ProcessedResult> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (!base64) return fallbackProcessing(uri, fileName);

    const apiResult = await callOcrApi(base64);
    if (apiResult) return apiResult;

    return fallbackProcessing(uri, fileName);
  } catch {
    return fallbackProcessing(uri, fileName);
  }
}

export async function processImagesInBatch(
  items: { id: string; imageUrl?: string; title: string; description?: string }[],
): Promise<{ id: string; title: string; description: string; summary: string; extractedText: string; category: string; imageUrl?: string }[]> {
  const results: { id: string; title: string; description: string; summary: string; extractedText: string; category: string; imageUrl?: string }[] = [];

  for (const item of items) {
    try {
      let processed: ProcessedResult;
      if (item.imageUrl && !item.imageUrl.startsWith('http')) {
        processed = await processImage(item.imageUrl, item.title);
      } else {
        processed = fallbackProcessing(item.imageUrl || '', item.title);
      }
      results.push({
        id: item.id,
        title: processed.title,
        description: processed.description,
        summary: processed.summary,
        extractedText: processed.extractedText,
        category: processed.category,
        imageUrl: processed.imageUrl,
      });
    } catch {
      const fallback = fallbackProcessing(item.imageUrl || '', item.title);
      results.push({
        id: item.id,
        title: fallback.title,
        description: fallback.description,
        summary: fallback.summary,
        extractedText: fallback.extractedText,
        category: fallback.category,
      });
    }
  }

  return results;
}
