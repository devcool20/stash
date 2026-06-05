import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import { Platform, ToastAndroid } from 'react-native';
import { db } from '../database';

interface TaskData {
  filePath: string;
}

const getServerUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const manifest = Constants.expoConfig || (Constants as any).manifest;
  const debuggerHost = manifest?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:3000`;
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
};

export default async function screenshotTask(taskData: TaskData) {
  const { filePath } = taskData;
  if (!filePath) {
    console.warn('Screenshot Ingestion Task: No filePath provided.');
    return;
  }

  console.log(`[ScreenshotIngestionTask] Processing captured screen: ${filePath}`);

  // 1. Stage temporary item in local database with status="processing"
  const tempItem = await db.add({
    type: 'image',
    title: 'Screen Capture',
    description: 'Engaging cloud analysis...',
    imageUrl: filePath,
    status: 'processing',
    category: 'Design',
  });

  try {
    // 2. Read file as base64
    const base64Data = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (!base64Data) {
      throw new Error('Failed to read image as base64 string.');
    }

    // 3. Post base64 data to backend /api/ocr
    const serverUrl = getServerUrl();
    console.log(`[ScreenshotIngestionTask] Sending base64 to server: ${serverUrl}/api/ocr`);
    
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 15000);

    const res = await fetch(`${serverUrl}/api/ocr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64: base64Data,
        mimeType: 'image/png',
      }),
      signal: abortController.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`OCR endpoint returned code ${res.status}`);
    }

    const ocrData = await res.json();
    console.log('[ScreenshotIngestionTask] Rich analysis completed:', ocrData);

    const finalTitle = ocrData.title || 'Extracted Screenshot';
    const finalDesc = ocrData.description || 'Extracted screenshot visual elements';
    const finalOcr = ocrData.text || '';
    const derived = ocrData.category || 'Design';

    // 4. Register category in AsyncStorage
    await db.addCategory(derived);

    // 5. Update local database item to status="ready"
    const readyItem = await db.update(tempItem.id, {
      title: finalTitle,
      description: finalDesc,
      category: derived,
      extractedText: finalOcr || 'No text extracted',
      status: 'ready',
    });

    // 6. Delete temp file from cache to keep filesystem clean
    try {
      await FileSystem.deleteAsync(filePath, { idempotent: true });
    } catch (e) {
      console.warn('[ScreenshotIngestionTask] Failed to delete cache file:', e);
    }

    // 7. Show native Toast notification
    if (Platform.OS === 'android') {
      ToastAndroid.show(`Stashed: ${finalTitle}`, ToastAndroid.SHORT);
    }
  } catch (err: any) {
    console.error('[ScreenshotIngestionTask] Processing failed:', err);
    // Cleanup temporary processing item on error
    try {
      await db.delete(tempItem.id);
    } catch (e) {}
    if (Platform.OS === 'android') {
      ToastAndroid.show(`Ingestion failed: ${err.message || err}`, ToastAndroid.LONG);
    }
  }
}
