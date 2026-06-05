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
  status: 'processing' | 'ready';
  createdAt: string;
}

export type ActiveCategory = string;

export type TabKey = 'stash' | 'categories' | 'profile';

export type CategoryKey = string;

export interface StorageMetrics {
  usedBytes: number;
  totalBytes: number;
}
