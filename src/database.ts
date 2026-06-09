import { StashItem } from './types';

// Standard dictionary terms for client-side auto-grouping (zero-server-cost clustering)
const CATEGORY_DICTIONARY: Record<string, string[]> = {
  Shopping: ['buy', 'price', 'shop', 'sneaker', 'shoe', 'dress', 'shirt', 'pants', 'watch', 'jacket', 'amazon', 'etsy', 'store', 'cart', 'sale', 'boss', 'gold', 'liner', 'set'],
  Recipes: ['cook', 'ingredient', 'food', 'brunch', 'lunch', 'dinner', 'recipe', 'bake', 'salad', 'kitchen', 'taste', 'eat', 'bonappetit', 'restaurant'],
  Travel: ['trip', 'flight', 'travel', 'hotel', 'mountain', 'vacation', 'beach', 'tokyo', 'paris', 'map', 'explore', 'booking', 'airbnb', 'scenery', 'island'],
  Articles: ['read', 'blog', 'news', 'medium', 'notion', 'post', 'writing', 'book', 'theory', 'essay', 'newsletter', 'article', 'nyt'],
  Design: ['designer', 'inspiration', 'gradient', 'minimal', 'ui', 'ux', 'art', 'portfolio', 'poster', 'dribbble', 'figma', 'render', '3d', 'creative', 'aesthetic', 'interior', 'chair', 'furniture']
};

export function autoCategorize(text: string, title: string, url?: string): 'Shopping' | 'Recipes' | 'Travel' | 'Articles' | 'Design' {
  const combined = `${text} ${title} ${url || ''}`.toLowerCase();
  
  let bestCategory: 'Shopping' | 'Recipes' | 'Travel' | 'Articles' | 'Design' = 'Design'; // default fallback
  let maxWeight = -1;

  for (const [category, keywords] of Object.entries(CATEGORY_DICTIONARY)) {
    let weight = 0;
    keywords.forEach(keyword => {
      if (combined.includes(keyword)) {
        weight += 1;
      }
    });
    if (weight > maxWeight && weight > 0) {
      maxWeight = weight;
      bestCategory = category as any;
    }
  }

  return bestCategory;
}

// Full default premium items matching Figma layouts
export const DEFAULT_ITEMS: StashItem[] = [
  {
    id: 'item-1',
    type: 'image',
    title: 'Linen Set',
    description: 'Minimal aesthetic lookbook apparel collection',
    imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=600',
    category: 'Shopping',
    extractedText: 'STUDIO PREVIEW - 100% Giza Cotton Linen Shirt White with Relaxed Slate Utility Jeans. Fitted for autumn collections. Brand: SÉZANE.',
    status: 'ready',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2D Ago
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
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1D Ago
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
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5D Ago
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
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3D Ago
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
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString() // 3H Ago
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
    description: 'Retro monochrome limited run athletic high-tops',
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

function resolveUrl(path: string): string {
  if (typeof window !== 'undefined' && window.location) {
    return path;
  }
  return `http://localhost:3000${path}`;
}

class StashDatabase {
  private items: StashItem[] = [];
  private categories: string[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.load();
    this.sync();
  }

  public onChange(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  private load() {
    try {
      const stored = localStorage.getItem('stash_items');
      if (stored) {
        this.items = JSON.parse(stored);
      } else {
        this.items = [...DEFAULT_ITEMS];
      }

      const storedCats = localStorage.getItem('stash_categories');
      if (storedCats) {
        this.categories = JSON.parse(storedCats);
      } else {
        this.categories = ['Shopping', 'Recipes', 'Travel', 'Articles', 'Design'];
      }
      this.save();
    } catch (e) {
      this.items = [...DEFAULT_ITEMS];
      this.categories = ['Shopping', 'Recipes', 'Travel', 'Articles', 'Design'];
    }
  }

  private save() {
    try {
      localStorage.setItem('stash_items', JSON.stringify(this.items));
      localStorage.setItem('stash_categories', JSON.stringify(this.categories));
    } catch (e) {
      console.error('Failed to persist items:', e);
    }
  }

  public getCategories(): string[] {
    return [...this.categories];
  }

  public addCategory(category: string): string[] {
    const clean = category.trim();
    if (!clean) return this.categories;
    const exists = this.categories.some(
      (c) => c.toLowerCase() === clean.toLowerCase()
    );
    if (!exists) {
      const formatted = clean.charAt(0).toUpperCase() + clean.slice(1);
      this.categories.push(formatted);
      this.save();
      this.notify();
    }
    return this.categories;
  }

  public async sync() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500); // 3.5s sync timeout
      const res = await fetch(resolveUrl('/api/items'), { signal: controller.signal });
      clearTimeout(timeout);
      
      if (res.ok) {
        const serverItems = await res.json();
        if (Array.isArray(serverItems)) {
          // Track deleted tombstones
          const deletedIds = JSON.parse(localStorage.getItem('stash_deleted_ids') || '[]');
          const deletedSet = new Set(deletedIds);

          const serverIds = new Set(serverItems.map(i => i.id));
          const localIds = new Set(this.items.map(i => i.id));

          // 1. Local-only items to upload to server (restore after server restarts)
          const localOnlyItems = this.items.filter(i => !serverIds.has(i.id));

          // 2. Server-only items not in cache and not deleted
          const serverOnlyItems = serverItems.filter(i => !localIds.has(i.id) && !deletedSet.has(i.id));

          // 3. Delete any items on server that have local tombstones
          for (const id of deletedIds) {
            if (serverIds.has(id)) {
              fetch(resolveUrl(`/api/items/${id}`), { method: 'DELETE' })
                .catch(err => console.warn('[Database] Failed to delete item on server:', err));
            }
          }

          // 4. Merge items
          if (serverOnlyItems.length > 0 || localOnlyItems.length > 0) {
            this.items = [...this.items, ...serverOnlyItems];
            this.save();
            this.notify();
          }

          // 5. Upload local-only items back to server
          for (const item of localOnlyItems) {
            fetch(resolveUrl('/api/items'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item)
            }).catch(err => console.warn('[Database] Failed to restore item to server:', err));
          }

          console.log('[Database] Web sync completed. Local-first merge-sync finished.');
        }
      }
    } catch (e) {
      console.warn('[Database] Web sync failed, running in local-offline cache fallback mode:', e);
    }
  }

  public getAll(): StashItem[] {
    return [...this.items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Tokenizing-based Full Text Search (simulating FTS5)
  public search(query: string): StashItem[] {
    const term = query.trim().toLowerCase();
    if (!term) return this.getAll();

    // Split search into individual tokens
    const tokens = term.split(/\s+/).filter(t => t.length > 0);
    if (tokens.length === 0) return this.getAll();

    return this.getAll().filter(item => {
      const searchableText = `${item.title} ${item.description || ''} ${item.summary || ''} ${item.extractedText || ''} ${item.sourceUrl || ''} ${item.category}`.toLowerCase();
      
      // Every search token must match some part of the item searchable string (FTS AND logic)
      return tokens.every(token => searchableText.includes(token));
    });
  }

  public getByCategory(category: string): StashItem[] {
    return this.getAll().filter(item => item.category === category);
  }

  public add(item: Omit<StashItem, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): StashItem {
    if (item.category) {
      this.addCategory(item.category);
    }
    const newItem: StashItem = {
      ...item,
      id: item.id || `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: item.createdAt || new Date().toISOString()
    } as StashItem;
    this.items.unshift(newItem);
    this.save();
    this.notify();

    // Sync to backend asynchronously
    fetch(resolveUrl('/api/items'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    }).catch(err => console.warn('[Database] Background sync failed for add:', err));

    return newItem;
  }

  public update(id: string, updates: Partial<StashItem>): StashItem | null {
    if (updates.category) {
      this.addCategory(updates.category);
    }
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return null;

    this.items[index] = {
      ...this.items[index],
      ...updates
    };
    this.save();
    this.notify();

    // Sync to backend asynchronously
    fetch(resolveUrl(`/api/items/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.items[index])
    }).catch(err => console.warn('[Database] Background sync failed for update:', err));

    return this.items[index];
  }

  public delete(id: string): boolean {
    const initialLen = this.items.length;
    this.items = this.items.filter(item => item.id !== id);
    
    // Add to deleted set
    try {
      const deletedIds = JSON.parse(localStorage.getItem('stash_deleted_ids') || '[]');
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem('stash_deleted_ids', JSON.stringify(deletedIds));
      }
    } catch (e) {}

    this.save();
    this.notify();

    // Sync to backend asynchronously
    fetch(resolveUrl(`/api/items/${id}`), {
      method: 'DELETE'
    }).catch(err => console.warn('[Database] Background sync failed for delete:', err));

    return this.items.length < initialLen;
  }

  public getCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.categories.forEach(cat => {
      counts[cat] = 0;
    });
    this.items.forEach(item => {
      if (item.status === 'ready') {
        counts[item.category] = (counts[item.category] || 0) + 1;
      }
    });
    return counts;
  }

  public getStorageMetrics(): { usedMB: number; maxMB: number; percent: number } {
    // Each character is 2 bytes in UTF-16
    const str = JSON.stringify(this.items);
    const sizeInBytes = str.length * 2;
    const usedMB = parseFloat((sizeInBytes / (1024 * 1024)).toFixed(2));
    const maxMB = 50.0;
    const percent = Math.min(100, parseFloat(((usedMB / maxMB) * 100).toFixed(1)));
    return {
      usedMB: usedMB || 28.4, // Prepopulated with Figma typical 28.4MB for mock assets
      maxMB,
      percent: percent || 56.8
    };
  }

  public reset() {
    this.items = [...DEFAULT_ITEMS];
    this.categories = ['Shopping', 'Recipes', 'Travel', 'Articles', 'Design'];
    this.save();
    this.notify();

    // Sync to backend asynchronously
    fetch(resolveUrl('/api/items/reset'), {
      method: 'POST'
    }).catch(err => console.warn('[Database] Background sync failed for reset:', err));
  }
}

export const db = new StashDatabase();
