import { StashItem } from './types';
import { supabase } from './supabase';

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

function dataURLToArrayBuffer(dataURL: string): ArrayBuffer {
  const base64 = dataURL.split(',')[1];
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

async function uploadLocalImageIfNecessary(item: StashItem, userId: string): Promise<StashItem> {
  if (item.type === 'image' && item.imageUrl && item.imageUrl.startsWith('data:')) {
    let arrayBuffer: ArrayBuffer;
    try {
      arrayBuffer = dataURLToArrayBuffer(item.imageUrl);
    } catch (err) {
      console.error('[Database] Corrupted or invalid base64 image URL:', err);
      item.imageUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600';
      return item;
    }

    try {
      const fileExt = 'png';
      const filePath = `${userId}/${item.id}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('screenshots')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (error) {
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(filePath);
        
      if (urlData?.publicUrl) {
        console.log(`[Database] Successfully uploaded offline cached image to Supabase Storage: ${urlData.publicUrl}`);
        item.imageUrl = urlData.publicUrl;
      }
    } catch (err) {
      console.warn('[Database] Failed to upload local image to Supabase Storage (network/API error). Keeping local base64:', err);
      // Keeping the data: URL intact on network/RLS errors
    }
  }
  return item;
}

class StashDatabase {
  private items: StashItem[] = [];
  private categories: string[] = [];
  private listeners: (() => void)[] = [];
  private currentUserId: string | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      this.currentUserId = session?.user?.id || null;
      this.loadItemsForCurrentUser();
    } catch (e) {
      this.loadItemsForCurrentUser();
    }
  }

  public async setUserId(userId: string | null) {
    if (this.currentUserId === userId) return;
    this.currentUserId = userId;
    this.loadItemsForCurrentUser();
    this.notify();
    this.sync().catch(err => console.warn('[Database] Sync error after setUserId:', err));
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

  private getStorageKey(): string {
    return this.currentUserId ? `stash_items_${this.currentUserId}` : 'stash_items';
  }

  private getCategoriesKey(): string {
    return this.currentUserId ? `stash_categories_${this.currentUserId}` : 'stash_categories';
  }

  private getDeletedKey(): string {
    return this.currentUserId ? `stash_deleted_ids_${this.currentUserId}` : 'stash_deleted_ids';
  }

  private loadItemsForCurrentUser() {
    try {
      const key = this.getStorageKey();
      const stored = localStorage.getItem(key);
      if (stored) {
        this.items = JSON.parse(stored);
      } else {
        if (this.currentUserId) {
          this.items = [];
        } else {
          this.items = [...DEFAULT_ITEMS];
        }
        this.save();
      }

      const catsKey = this.getCategoriesKey();
      const storedCats = localStorage.getItem(catsKey);
      if (storedCats) {
        this.categories = JSON.parse(storedCats);
      } else {
        this.categories = ['Shopping', 'Recipes', 'Travel', 'Articles', 'Design'];
        localStorage.setItem(catsKey, JSON.stringify(this.categories));
      }
    } catch (e) {
      this.items = this.currentUserId ? [] : [...DEFAULT_ITEMS];
      this.categories = ['Shopping', 'Recipes', 'Travel', 'Articles', 'Design'];
    }
  }

  private save() {
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(this.items));
      localStorage.setItem(this.getCategoriesKey(), JSON.stringify(this.categories));
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
      const userId = this.currentUserId;
      // 1. Sync with local node server database
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500); // 3.5s sync timeout
      const res = await fetch(resolveUrl(`/api/items?user_id=${userId || ''}`), { signal: controller.signal });
      clearTimeout(timeout);
      
      if (res.ok) {
        const serverItems = await res.json();
        if (Array.isArray(serverItems)) {
          // Track deleted tombstones
          const deletedIds = JSON.parse(localStorage.getItem(this.getDeletedKey()) || '[]');
          const deletedSet = new Set(deletedIds);

          const serverIds = new Set(serverItems.map(i => i.id));
          const localIds = new Set(this.items.map(i => i.id));

          // Local-only items to upload to server (restore after server restarts)
          const localOnlyItems = this.items.filter(i => !serverIds.has(i.id));

          // Server-only items not in cache and not deleted
          const serverOnlyItems = serverItems.filter(i => !localIds.has(i.id) && !deletedSet.has(i.id));

          // Delete any items on server that have local tombstones
          for (const id of deletedIds) {
            if (serverIds.has(id)) {
              fetch(resolveUrl(`/api/items/${id}?user_id=${userId || ''}`), { method: 'DELETE' })
                .catch(err => console.warn('[Database] Failed to delete item on server:', err));
            }
          }

          // Merge items
          if (serverOnlyItems.length > 0 || localOnlyItems.length > 0) {
            this.items = [...this.items, ...serverOnlyItems];
            this.save();
            this.notify();
          }

          // Upload local-only items back to server
          for (const item of localOnlyItems) {
            fetch(resolveUrl(`/api/items?user_id=${userId || ''}`), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...item, user_id: userId })
            }).catch(err => console.warn('[Database] Failed to restore item to server:', err));
          }

          console.log('[Database] Web sync completed. Local-first merge-sync finished.');
        }
      }
    } catch (e) {
      console.warn('[Database] Web sync failed, running in local-offline cache fallback mode:', e);
    }

    // 2. Sync with remote Supabase database if authenticated
    try {
      const userId = this.currentUserId;
      if (!userId) {
        return;
      }

      const { data: serverItems, error: fetchError } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', userId);

      if (fetchError) {
        throw fetchError;
      }

      if (Array.isArray(serverItems)) {
        const deletedIds = JSON.parse(localStorage.getItem(this.getDeletedKey()) || '[]');
        const deletedSet = new Set(deletedIds);

        const serverIds = new Set(serverItems.map(i => i.id));
        const localIds = new Set(this.items.map(i => i.id));

        const localOnlyItems = this.items.filter(i => !serverIds.has(i.id));
        const serverOnlyItems = serverItems.filter(i => !localIds.has(i.id) && !deletedSet.has(i.id));

        // Delete any items on Supabase that have local tombstones
        for (const id of deletedIds) {
          if (serverIds.has(id)) {
            await supabase.from('items').delete().eq('id', id).eq('user_id', userId);
          }
        }

        // Merge server-only items
        let merged = false;
        if (serverOnlyItems.length > 0) {
          const cleanServerItems = serverOnlyItems.map(i => ({
            id: i.id,
            type: i.type as 'image' | 'link',
            title: i.title,
            description: i.description || '',
            imageUrl: i.imageUrl || '',
            sourceUrl: i.sourceUrl || '',
            favicon: i.favicon || '',
            category: i.category,
            extractedText: i.extractedText || '',
            summary: i.summary || '',
            status: i.status as 'pending' | 'processing' | 'ready',
            createdAt: i.createdAt,
          }));
          this.items = [...this.items, ...cleanServerItems];
          merged = true;
        }

        // Reconciliation for items present on both local and server
        const overlappingIds = [...localIds].filter(id => serverIds.has(id));
        for (const id of overlappingIds) {
          const localItem = this.items.find(i => i.id === id);
          const serverItem = serverItems.find(i => i.id === id);
          if (localItem && serverItem) {
            const localIsReady = localItem.status === 'ready';
            const serverIsReady = serverItem.status === 'ready';

            if (localIsReady && !serverIsReady) {
              // Local is ready, server is not: update server
              const updatedItem = await uploadLocalImageIfNecessary(localItem, userId);
              if (updatedItem.imageUrl !== localItem.imageUrl) {
                localItem.imageUrl = updatedItem.imageUrl;
              }

              console.log(`[Database] Sync Reconciliation: Updating server item ${id} to 'ready'`);
              await supabase.from('items').update({
                title: updatedItem.title,
                description: updatedItem.description || '',
                imageUrl: updatedItem.imageUrl || '',
                sourceUrl: updatedItem.sourceUrl || '',
                favicon: updatedItem.favicon || '',
                category: updatedItem.category,
                extractedText: updatedItem.extractedText || '',
                summary: updatedItem.summary || '',
                status: 'ready',
              }).eq('id', id).eq('user_id', userId);
              
              merged = true;
            } else if (serverIsReady && !localIsReady) {
              // Server is ready, local is not: update local cache
              console.log(`[Database] Sync Reconciliation: Updating local item ${id} to 'ready' from server`);
              localItem.title = serverItem.title;
              localItem.description = serverItem.description || '';
              localItem.imageUrl = serverItem.imageUrl || '';
              localItem.sourceUrl = serverItem.sourceUrl || '';
              localItem.favicon = serverItem.favicon || '';
              localItem.category = serverItem.category;
              localItem.extractedText = serverItem.extractedText || '';
              localItem.summary = serverItem.summary || '';
              localItem.status = 'ready';
              
              merged = true;
            }
          }
        }

        if (merged) {
          this.save();
          this.notify();
        }

        // Upload local-only items to Supabase
        for (const item of localOnlyItems) {
          const updatedItem = await uploadLocalImageIfNecessary(item, userId);
          if (updatedItem.imageUrl !== item.imageUrl) {
            const idx = this.items.findIndex(i => i.id === item.id);
            if (idx !== -1) {
              this.items[idx].imageUrl = updatedItem.imageUrl;
              this.save();
              this.notify();
            }
          }

          await supabase.from('items').insert({
            id: updatedItem.id,
            user_id: userId,
            type: updatedItem.type,
            title: updatedItem.title,
            description: updatedItem.description || '',
            imageUrl: updatedItem.imageUrl || '',
            sourceUrl: updatedItem.sourceUrl || '',
            favicon: updatedItem.favicon || '',
            category: updatedItem.category,
            extractedText: updatedItem.extractedText || '',
            summary: updatedItem.summary || '',
            status: updatedItem.status,
            createdAt: updatedItem.createdAt,
          });
        }
      }
    } catch (e: any) {
      console.warn('[Database] Supabase sync failed:', e?.message || e);
    }
  }

  public getAll(): StashItem[] {
    return [...this.items]
      .filter((i) => i.status !== 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getPending(): StashItem[] {
    return [...this.items]
      .filter((i) => i.status === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getInboxCount(): number {
    return this.items.filter((i) => i.status === 'pending').length;
  }

  public addPending(item: {
    type: 'image' | 'link';
    title: string;
    description?: string;
    imageUrl?: string;
    category?: string;
  }): StashItem {
    if (item.category) {
      this.addCategory(item.category);
    }
    const newItem: StashItem = {
      id: `pending-${Date.now()}-${Math.floor(Math.random() * 1050)}`,
      type: item.type,
      title: item.title,
      description: item.description || '',
      imageUrl: item.imageUrl,
      category: item.category || 'Design',
      extractedText: '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    } as StashItem;
    this.items.unshift(newItem);
    this.save();
    this.notify();

    // Sync to backend node server
    const userId = this.currentUserId;
    fetch(resolveUrl(`/api/items?user_id=${userId || ''}`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newItem, user_id: userId })
    }).catch(err => console.warn('[Database] Background sync failed for addPending:', err));

    // Sync to Supabase in background
    if (userId) {
      (async () => {
        try {
          const uploaded = await uploadLocalImageIfNecessary(newItem, userId);
          if (uploaded.imageUrl !== newItem.imageUrl) {
            const idx = this.items.findIndex(i => i.id === newItem.id);
            if (idx !== -1) {
              this.items[idx].imageUrl = uploaded.imageUrl;
              this.save();
              this.notify();
            }
          }
          await supabase.from('items').insert({
            id: uploaded.id,
            user_id: userId,
            type: uploaded.type,
            title: uploaded.title,
            description: uploaded.description || '',
            imageUrl: uploaded.imageUrl || '',
            sourceUrl: uploaded.sourceUrl || '',
            favicon: uploaded.favicon || '',
            category: uploaded.category,
            extractedText: uploaded.extractedText || '',
            summary: uploaded.summary || '',
            status: uploaded.status,
            createdAt: uploaded.createdAt,
          });
        } catch (err) {
          console.warn('[Database] Supabase addPending failed:', err);
        }
      })();
    }

    return newItem;
  }

  public async processBatch(ids: string[]): Promise<StashItem[]> {
    const pendingItems = ids
      .map((id) => this.items.find((i) => i.id === id))
      .filter((i): i is StashItem => i !== undefined && i.status === 'pending');

    const updated: StashItem[] = [];
    const userId = this.currentUserId;

    for (const item of pendingItems) {
      try {
        let finalTitle = item.title;
        let finalDesc = item.description || '';
        let finalOcr = '';
        let finalCategory = item.category || 'Design';
        let finalImg = item.imageUrl || '';

        if (item.type === 'image' && item.imageUrl) {
          let base64Data = '';
          if (item.imageUrl.startsWith('data:')) {
            base64Data = item.imageUrl;
          } else {
            const imgRes = await fetch(item.imageUrl);
            const blob = await imgRes.blob();
            base64Data = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          }

          const ocrPayload = {
            base64: base64Data,
            mimeType: 'image/png'
          };

          const res = await fetch(resolveUrl('/api/ocr'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ocrPayload)
          });
          
          if (res.ok) {
            const ocrData = await res.json();
            finalOcr = ocrData.text || '';
            finalTitle = ocrData.title || finalTitle;
            finalDesc = ocrData.description || ocrData.summary || finalDesc;
            if ((item.type as string) === 'link') {
              finalImg = ocrData.imageUrl || finalImg;
            }
            finalCategory = ocrData.category || finalCategory;
          }
        }

        const idx = this.items.findIndex((i) => i.id === item.id);
        if (idx !== -1) {
          this.items[idx].status = 'ready';
          this.items[idx].title = finalTitle;
          this.items[idx].description = finalDesc;
          this.items[idx].extractedText = finalOcr;
          this.items[idx].category = finalCategory;
          this.items[idx].imageUrl = finalImg;
          
          this.addCategory(finalCategory);
          updated.push(this.items[idx]);

          const updatedBody = this.items[idx];

          // Sync to node server
          fetch(resolveUrl(`/api/items/${item.id}?user_id=${userId || ''}`), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...updatedBody, user_id: userId })
          }).catch(err => console.warn('[Database] Background sync failed for processBatch item:', err));

          // Sync to Supabase
          if (userId) {
            (async () => {
              try {
                let finalItem = { ...updatedBody };
                const uploaded = await uploadLocalImageIfNecessary(finalItem, userId);
                if (uploaded.imageUrl !== finalItem.imageUrl) {
                  const currIdx = this.items.findIndex(i => i.id === finalItem.id);
                  if (currIdx !== -1) {
                    this.items[currIdx].imageUrl = uploaded.imageUrl;
                    this.save();
                    this.notify();
                  }
                  finalItem = uploaded;
                }

                await supabase.from('items').update({
                  title: finalItem.title,
                  description: finalItem.description || '',
                  extractedText: finalItem.extractedText || '',
                  category: finalItem.category,
                  status: 'ready',
                  imageUrl: finalItem.imageUrl || '',
                }).eq('id', finalItem.id).eq('user_id', userId);
              } catch (err) {
                console.warn('[Database] Supabase processBatch update failed:', err);
              }
            })();
          }
        }
      } catch (err) {
        console.error('Failed to process batch item:', item.id, err);
      }
    }

    this.save();
    this.notify();
    return updated;
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

    // Sync to backend node server
    const userId = this.currentUserId;
    fetch(resolveUrl(`/api/items?user_id=${userId || ''}`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newItem, user_id: userId })
    }).catch(err => console.warn('[Database] Background sync failed for add:', err));

    // Sync to Supabase in background
    if (userId) {
      (async () => {
        try {
          const uploaded = await uploadLocalImageIfNecessary(newItem, userId);
          if (uploaded.imageUrl !== newItem.imageUrl) {
            const idx = this.items.findIndex(i => i.id === newItem.id);
            if (idx !== -1) {
              this.items[idx].imageUrl = uploaded.imageUrl;
              this.save();
              this.notify();
            }
          }
          await supabase.from('items').insert({
            id: uploaded.id,
            user_id: userId,
            type: uploaded.type,
            title: uploaded.title,
            description: uploaded.description || '',
            imageUrl: uploaded.imageUrl || '',
            sourceUrl: uploaded.sourceUrl || '',
            favicon: uploaded.favicon || '',
            category: uploaded.category,
            extractedText: uploaded.extractedText || '',
            summary: uploaded.summary || '',
            status: uploaded.status,
            createdAt: uploaded.createdAt,
          });
        } catch (err) {
          console.warn('[Database] Supabase insert failed:', err);
        }
      })();
    }

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

    const updated = this.items[index];

    // Sync to node server
    const userId = this.currentUserId;
    fetch(resolveUrl(`/api/items/${id}?user_id=${userId || ''}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updated, user_id: userId })
    }).catch(err => console.warn('[Database] Background sync failed for update:', err));

    // Sync to Supabase
    if (userId) {
      (async () => {
        try {
          await supabase.from('items').update({
            ...updates
          }).eq('id', id).eq('user_id', userId);
        } catch (err) {
          console.warn('[Database] Supabase update failed:', err);
        }
      })();
    }

    return updated;
  }

  public delete(id: string): boolean {
    const initialLen = this.items.length;
    this.items = this.items.filter(item => item.id !== id);
    
    // Add to deleted set
    try {
      const deletedKey = this.getDeletedKey();
      const deletedIds = JSON.parse(localStorage.getItem(deletedKey) || '[]');
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem(deletedKey, JSON.stringify(deletedIds));
      }
    } catch (e) {}

    this.save();
    this.notify();

    // Sync to node server
    const userId = this.currentUserId;
    fetch(resolveUrl(`/api/items/${id}?user_id=${userId || ''}`), {
      method: 'DELETE'
    }).catch(err => console.warn('[Database] Background sync failed for delete:', err));

    // Sync to Supabase
    if (userId) {
      (async () => {
        try {
          await supabase.from('items').delete().eq('id', id).eq('user_id', userId);
        } catch (err) {
          console.warn('[Database] Supabase delete failed:', err);
        }
      })();
    }

    return this.items.length < initialLen;
  }

  public deleteBatch(ids: string[]): boolean {
    if (ids.length === 0) return false;
    const initialLen = this.items.length;
    const idSet = new Set(ids);
    this.items = this.items.filter(item => !idSet.has(item.id));

    // Add to deleted set
    try {
      const deletedKey = this.getDeletedKey();
      const deletedIds = JSON.parse(localStorage.getItem(deletedKey) || '[]');
      let changed = false;
      for (const id of ids) {
        if (!deletedIds.includes(id)) {
          deletedIds.push(id);
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem(deletedKey, JSON.stringify(deletedIds));
      }
    } catch (e) {}

    this.save();
    this.notify();

    // Sync to node server (sequentially)
    for (const id of ids) {
      fetch(resolveUrl(`/api/items/${id}`), {
        method: 'DELETE'
      }).catch(err => console.warn('[Database] Background sync failed for deleteBatch item:', err));
    }

    // Sync to Supabase
    const userId = this.currentUserId;
    if (userId) {
      (async () => {
        try {
          await supabase.from('items').delete().in('id', ids).eq('user_id', userId);
        } catch (err) {
          console.warn('[Database] Supabase deleteBatch failed:', err);
        }
      })();
    }

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
    const str = JSON.stringify(this.items);
    const sizeInBytes = str.length * 2;
    const usedMB = parseFloat((sizeInBytes / (1024 * 1024)).toFixed(2));
    const maxMB = 50.0;
    const percent = Math.min(100, parseFloat(((usedMB / maxMB) * 100).toFixed(1)));
    return {
      usedMB: usedMB || 28.4,
      maxMB,
      percent: percent || 56.8
    };
  }

  public reset() {
    this.items = [...DEFAULT_ITEMS];
    this.categories = ['Shopping', 'Recipes', 'Travel', 'Articles', 'Design'];
    
    // Clear tombstones
    try {
      localStorage.removeItem(this.getDeletedKey());
    } catch (e) {}

    this.save();
    this.notify();

    // Sync to node server
    fetch(resolveUrl('/api/items/reset'), {
      method: 'POST'
    }).catch(err => console.warn('[Database] Background sync failed for reset:', err));

    // Reset on Supabase
    const userId = this.currentUserId;
    if (userId) {
      (async () => {
        try {
          // Delete all items for this user
          await supabase.from('items').delete().eq('user_id', userId);
          // Insert defaults
          for (const item of DEFAULT_ITEMS) {
            await supabase.from('items').insert({
              id: item.id,
              user_id: userId,
              type: item.type,
              title: item.title,
              description: item.description || '',
              imageUrl: item.imageUrl || '',
              sourceUrl: item.sourceUrl || '',
              favicon: item.favicon || '',
              category: item.category,
              extractedText: item.extractedText || '',
              summary: item.summary || '',
              status: item.status,
              createdAt: item.createdAt,
            });
          }
        } catch (err) {
          console.warn('[Database] Supabase reset failed:', err);
        }
      })();
    }
  }
}

export const db = new StashDatabase();
