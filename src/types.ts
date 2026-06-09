export interface StashItem {
  id: string;
  type: 'image' | 'link';
  title: string;
  description?: string;
  imageUrl?: string;
  sourceUrl?: string;
  favicon?: string;
  category: string;
  extractedText?: string;
  summary?: string;
  status: 'pending' | 'processing' | 'ready';
  createdAt: string;
}

export type ActiveCategory = string;

export interface StorageMetrics {
  usedBytes: number;
  totalBytes: number;
}
