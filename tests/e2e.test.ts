// Mock localStorage before database import to run in Node.js environment
const mockStorage: Record<string, string> = {};
global.localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  clear: () => {
    for (const k in mockStorage) delete mockStorage[k];
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  length: 0,
  key: (index: number) => null,
} as any;

import { db, autoCategorize } from '../src/database';
import { StashItem } from '../src/types';
import assert from 'assert';
import { spawn, ChildProcess } from 'child_process';
import net from 'net';

const SERVER_URL = 'http://localhost:3000';

// A tiny 1x1 transparent PNG base64 representation with some visual text context if needed
// This acts as a standard small image to send to the OCR endpoint
const TEST_IMAGE_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVQIW2P8z8AARAwMjDAGACwBA/+8RVWvAAAAAElFTkSuQmCC';

// Connects to the port as a client to verify if the server is listening, avoiding socket binding conflicts.
async function isPortActive(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const onError = () => {
      socket.destroy();
      resolve(false);
    };
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', onError);
    socket.once('timeout', onError);
    socket.connect(port, '127.0.0.1');
  });
}

async function runTestSuite() {
  console.log('\x1b[35m==================================================\x1b[0m');
  console.log('\x1b[35m       STASH E2E & FUNCTIONAL TEST SUITE          \x1b[0m');
  console.log('\x1b[35m==================================================\x1b[0m');

  let serverProcess: ChildProcess | null = null;

  // 1. Dynamic Server setup check
  try {
    const active = await isPortActive(3000);
    if (!active) {
      console.log('📡 \x1b[33mNo running server found on port 3000. Launching temporary test server...\x1b[0m');
      // Using tsx to launch server in background
      serverProcess = spawn('npx', ['tsx', 'server.ts'], {
        stdio: 'ignore',
        detached: false,
        shell: true // Required for windows command execution
      });

      // Wait for port 3000 to become active (up to 15 seconds)
      let retries = 30;
      while (retries > 0 && !(await isPortActive(3000))) {
        await new Promise(r => setTimeout(r, 500));
        retries--;
      }

      if (retries === 0) {
        throw new Error('Timeout waiting for temporary server on port 3000.');
      }
      console.log('🚀 \x1b[32mTemporary test server started successfully on port 3000.\x1b[0m\n');
    } else {
      console.log('📡 \x1b[32mConnected to existing active server on port 3000.\x1b[0m\n');
    }
  } catch (err) {
    console.error('\x1b[31mFailed to establish Express test server context:\x1b[0m', err);
    if (serverProcess) {
      try { serverProcess.kill(); } catch {}
    }
    process.exit(1);
  }

  let passedTests = 0;
  let failedTests = 0;

  const test = async (name: string, fn: () => Promise<void> | void) => {
    try {
      process.stdout.write(`⏳ \x1b[33mTesting: ${name}...\x1b[0m`);
      await fn();
      console.log(`\r\x1b[K✅ \x1b[32mPassed: ${name}\x1b[0m`);
      passedTests++;
    } catch (err: any) {
      console.log(`\r\x1b[K❌ \x1b[31mFailed: ${name}\x1b[0m`);
      console.error('\x1b[31m', err, '\x1b[0m');
      failedTests++;
    }
  };

  try {
    // --------------------------------------------------
    // TEST SUITE 1: Database CRUD & Search Logic
    // --------------------------------------------------
    console.log('\n\x1b[36m--- Test Suite 1: Local Database Core Operations ---\x1b[0m');

    await test('Load pre-populated Default Items', () => {
      db.reset();
      const items = db.getAll();
      assert.strictEqual(items.length, 10, 'Should load exactly 10 initial lookbook items');
      // item-7 is created 1.5 hours ago, item-5 is 3 hours ago, so item-7 is newest
      assert.strictEqual(items[0].id, 'item-7', 'First item in default sorted stack should be item-7 (newest)');
    });

    await test('Add New Stash Item', () => {
      const initialCount = db.getAll().length;
      const newItem = db.add({
        type: 'link',
        title: 'ViteJS Dev tools',
        description: 'Lightning fast frontend build tooling site',
        sourceUrl: 'https://vite.dev',
        category: 'Design',
        status: 'ready'
      });

      assert.ok(newItem.id.startsWith('item-'), 'Generated ID should start with item-');
      assert.strictEqual(db.getAll().length, initialCount + 1, 'Database count should increment by 1');
      assert.strictEqual(db.getAll()[0].title, 'ViteJS Dev tools', 'Newly added item should be at index 0');
    });

    await test('Update Existing Stash Item', () => {
      const items = db.getAll();
      const targetId = items[0].id;
      const updated = db.update(targetId, {
        title: 'ViteJS Premium Tools',
        category: 'Shopping'
      });

      assert.ok(updated, 'Update call should return updated object');
      assert.strictEqual(updated.title, 'ViteJS Premium Tools', 'Title should update');
      assert.strictEqual(updated.category, 'Shopping', 'Category should update');
      assert.strictEqual(db.getAll()[0].title, 'ViteJS Premium Tools', 'Persistent store should show updated title');
    });

    await test('FTS Tokenized Search Engine', () => {
      // Search with single token
      const resultsSingle = db.search('Linen');
      assert.ok(resultsSingle.length >= 1, 'Should find at least Linen Set');
      assert.ok(resultsSingle.every(item => item.title.toLowerCase().includes('linen') || (item.extractedText && item.extractedText.toLowerCase().includes('linen'))));

      // Search with multiple tokens (AND condition)
      const resultsMulti = db.search('Giza Cotton');
      assert.strictEqual(resultsMulti.length, 1, 'Should match exactly 1 item for "Giza Cotton"');
      assert.strictEqual(resultsMulti[0].title, 'Linen Set', 'Should match Linen Set');

      // Case-insensitivity test
      const resultsCaps = db.search('RUNNER');
      assert.ok(resultsCaps.length >= 1, 'Should match Runner case insensitively');
    });

    await test('Get Category Counts', () => {
      const counts = db.getCounts();
      assert.ok('Shopping' in counts, 'Counts should include Shopping category');
      assert.ok(counts.Shopping > 0, 'Shopping count should be greater than zero');
    });

    await test('Get Storage Allocation Metrics', () => {
      const metrics = db.getStorageMetrics();
      assert.ok(metrics.usedMB > 0, 'Used storage size should be greater than 0MB');
      assert.ok(metrics.percent > 0, 'Storage allocation percentage should be greater than 0%');
    });

    await test('Delete Stash Item', () => {
      const items = db.getAll();
      const targetId = items[0].id;
      const deleted = db.delete(targetId);

      assert.strictEqual(deleted, true, 'Delete operation should return true');
      assert.ok(!db.getAll().some(item => item.id === targetId), 'Deleted item should not exist in database');
    });

    // --------------------------------------------------
    // TEST SUITE 2: Heuristics Auto-Categorization
    // --------------------------------------------------
    console.log('\n\x1b[36m--- Test Suite 2: Heuristic Auto-Categorization ---\x1b[0m');

    await test('Auto-Categorize keywords correctly', () => {
      // Recipes trigger
      const recipeCat = autoCategorize('Preparing healthy food recipe at home', 'Brunch Spread');
      assert.strictEqual(recipeCat, 'Recipes', 'Recipe keywords should categorize as Recipes');

      // Shopping trigger
      const shopCat = autoCategorize('Buy new titanium watch on sale', 'Limited Chrono Drop');
      assert.strictEqual(shopCat, 'Shopping', 'Shopping keywords should categorize as Shopping');

      // Design trigger
      const designCat = autoCategorize('Translucent frosted glassmorphism ui mockup', 'Figma layouts');
      assert.strictEqual(designCat, 'Design', 'Design keywords should categorize as Design');

      // Travel trigger
      const travelCat = autoCategorize('Booking flight ticket for mountain vacation', 'Hiking Mt Fuji');
      assert.strictEqual(travelCat, 'Travel', 'Travel keywords should categorize as Travel');
    });

    // --------------------------------------------------
    // TEST SUITE 3: Server Metadata Hydration Proxy API
    // --------------------------------------------------
    console.log('\n\x1b[36m--- Test Suite 3: Backend Server Metadata API ---\x1b[0m');

    await test('Verify /api/metadata scrapes targets', async () => {
      const testUrl = 'https://github.com';
      const res = await fetch(`${SERVER_URL}/api/metadata?url=${encodeURIComponent(testUrl)}`);
      assert.strictEqual(res.status, 200, 'Metadata server endpoint should return HTTP 200');
      
      const meta = await res.json();
      assert.ok(meta.title, 'Returned metadata should include a title');
      assert.ok(meta.description, 'Returned metadata should include a description');
      assert.ok(meta.imageUrl, 'Returned metadata should include an imageUrl');
      assert.strictEqual(meta.sourceUrl, testUrl, 'Source URL should match query URL');
      console.log(`   Scraped website details: [Title: "${meta.title}"]`);
    });

    // --------------------------------------------------
    // TEST SUITE 4: Server Gemini OCR Engine API
    // --------------------------------------------------
    console.log('\n\x1b[36m--- Test Suite 4: Backend Server Gemini OCR API ---\x1b[0m');

    await test('Verify /api/ocr processes image payloads', async () => {
      const payload = {
        base64: TEST_IMAGE_BASE64,
        mimeType: 'image/png'
      };

      const res = await fetch(`${SERVER_URL}/api/ocr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      assert.strictEqual(res.status, 200, 'OCR endpoint should return HTTP 200');
      const data = await res.json();
      assert.ok('text' in data, 'OCR response should have a text property');
      assert.strictEqual(typeof data.text, 'string', 'OCR text property should be a string');
      assert.ok('title' in data, 'OCR response should have a title property');
      assert.ok('description' in data, 'OCR response should have a description property');
      assert.ok('category' in data, 'OCR response should have a category property');
      assert.ok('tags' in data, 'OCR response should have a tags property');
      console.log(`   OCR Result Title: [${data.title}], Category: [${data.category}]`);
    });

    // --------------------------------------------------
    // TEST SUITE 5: Full End-to-End Flow Validation
    // --------------------------------------------------
    console.log('\n\x1b[36m--- Test Suite 5: End-to-End Ingestion Pipelines ---\x1b[0m');

    await test('E2E Link Ingest Pipeline Flow', async () => {
      const linkUrl = 'https://news.ycombinator.com';
      
      // Step 1: Client simulates loading, stages a temporary 'processing' item
      const tempItem = db.add({
        type: 'link',
        title: 'Hacker News',
        description: 'Intercepting metadata coordinates...',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
        sourceUrl: linkUrl,
        status: 'processing',
        category: 'Articles'
      });

      assert.strictEqual(tempItem.status, 'processing', 'Staged item should start in processing state');

      // Step 2: Fetch actual metadata from backend
      const metaRes = await fetch(`${SERVER_URL}/api/metadata?url=${encodeURIComponent(linkUrl)}`);
      const meta = await metaRes.json();

      // Step 3: Run heuristics auto-categorization
      const autoCat = autoCategorize(`${meta.title} ${meta.description}`, meta.title, linkUrl);
      
      // Step 4: Finalize item in DB to 'ready'
      const readyItem = db.update(tempItem.id, {
        title: meta.title || tempItem.title,
        description: meta.description || tempItem.description,
        imageUrl: meta.imageUrl || tempItem.imageUrl,
        category: autoCat,
        status: 'ready'
      });

      assert.ok(readyItem, 'DB update should successfully update item');
      assert.strictEqual(readyItem.status, 'ready', 'Finalized item status should be ready');
      assert.strictEqual(db.search(meta.title)[0].id, readyItem.id, 'FTS search for scraped title should find the stashed item');
      console.log(`   Stashed link category: [${readyItem.category}]`);
    });

    await test('E2E Image/Screenshot Ingest Pipeline Flow', async () => {
      const imgTitle = 'Receipt Ingest';

      // Step 1: Stage temporary processing item
      const tempItem = db.add({
        type: 'image',
        title: imgTitle,
        description: 'Engaging local OCR scan...',
        imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600',
        status: 'processing',
        category: 'Design'
      });

      // Step 2: Call server OCR
      const ocrPayload = {
        base64: TEST_IMAGE_BASE64,
        mimeType: 'image/png'
      };
      const ocrRes = await fetch(`${SERVER_URL}/api/ocr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ocrPayload)
      });
      const ocrData = await ocrRes.json();
      const extractedText = ocrData.text || '';

      // Step 3: Run auto categorization
      const autoCat = autoCategorize(extractedText, imgTitle);

      // Step 4: Finalize
      const readyItem = db.update(tempItem.id, {
        description: extractedText.substring(0, 100) + '...',
        category: autoCat,
        extractedText,
        status: 'ready'
      });

      assert.ok(readyItem, 'DB update should succeed');
      assert.strictEqual(readyItem.status, 'ready', 'Finalized status should be ready');
      assert.strictEqual(readyItem.extractedText, extractedText, 'Extracted text must match server OCR result');
      console.log(`   OCR categorization result: [${readyItem.category}]`);
    });

  } finally {
    // Teardown temporary server
    if (serverProcess) {
      console.log('\n🛑 \x1b[33mShutting down temporary test server...\x1b[0m');
      serverProcess.kill();
    }
  }

  console.log('\n\x1b[35m==================================================\x1b[0m');
  console.log(`\x1b[35mTest Execution Finished!\x1b[0m`);
  console.log(`🏆 \x1b[32mPassed: ${passedTests} / ${passedTests + failedTests}\x1b[0m`);
  if (failedTests > 0) {
    console.log(`💥 \x1b[31mFailed: ${failedTests}\x1b[0m`);
    console.log('\x1b[35m==================================================\x1b[0m');
    process.exit(1);
  } else {
    console.log(`🎈 \x1b[32mAll test suites completed successfully!\x1b[0m`);
    console.log('\x1b[35m==================================================\x1b[0m');
    process.exit(0);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
