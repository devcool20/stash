export interface StashItem {
  id: string;
  type: 'image' | 'link';
  title: string;
  description?: string;
  imageUrl?: string;
  sourceUrl?: string;
  favicon?: string;
  category: 'Shopping' | 'Recipes' | 'Travel' | 'Articles' | 'Design';
  extractedText?: string;
  status: 'processing' | 'ready';
  createdAt: string;
}

export type ActiveCategory =
  | 'All'
  | 'Shopping'
  | 'Recipes'
  | 'Travel'
  | 'Articles'
  | 'Design';

export type TabKey = 'stash' | 'categories' | 'profile';

export type CategoryKey =
  | 'Shopping'
  | 'Recipes'
  | 'Travel'
  | 'Articles'
  | 'Design';

export interface StorageMetrics {
  usedBytes: number;
  totalBytes: number;
}
