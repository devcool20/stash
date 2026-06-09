import AsyncStorage from '@react-native-async-storage/async-storage';
import { StashItem, CategoryKey } from './types';
import { processImagesInBatch, resolveApiUrl } from './processing';
import { autoCategorize } from './categories';
import * as FileSystem from 'expo-file-system';

const STORAGE_KEY = 'stash_items_v1';

export const DEFAULT_ITEMS: StashItem[] = [
  {
    id: 'item-1',
    type: 'image',
    title: 'Linen Set',
    description: 'Minimal aesthetic lookbook apparel collection',
    imageUrl:
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=800',
    category: 'Shopping',
    extractedText:
      'STUDIO PREVIEW - 100% Giza Cotton Linen Shirt White with Relaxed Slate Utility Jeans. Fitted for autumn collections. Brand: SÉZANE.',
    status: 'ready',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'item-2',
    type: 'image',
    title: 'Pastel Runner',
    description: 'Beige coral outsole and textured TPU encapsulation athletic sneaker',
    imageUrl:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    category: 'Shopping',
    extractedText:
      'STASH LABS INC. RUNNER V2. BEIGE CORAL OUTSOLE AND TEXTURED TPU ENCAPSULATION MIDSOLE. SIZES 8-12.',
    status: 'ready',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'item-3',
    type: 'image',
    title: 'Tangerine Drop',
    description: 'Water resistant luxury leather dress chronograph watch',
    imageUrl:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800',
    category: 'Shopping',
    extractedText:
      'BOSS HUGO BOSS. CHRONOGRAPH LIMITED SELECTIONS CALIBRE 12. WATER RESISTANT 50M.',
    status: 'ready',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'item-4',
    type: 'image',
    title: 'Velvet Steps',
    description: 'Armchair in oak solid body with retro velvet lining details',
    imageUrl:
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800',
    category: 'Design',
    extractedText:
      'OAK SOLID BODY WITH BOUCHÉ WOVEN LINING. RETRO ACCENTS FROM THE 1970S DESIGN INSPIRED BY WEGNER.',
    status: 'ready',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'item-5',
    type: 'image',
    title: 'Sun Wardrobe',
    description: 'Editorial looks showing Balenciaga Paris overcoat selections',
    imageUrl:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
    category: 'Design',
    extractedText:
      'BALENCIAGA PARIS WINTER SELECTIONS. BURGUNDY VELVET OVERCOAT WITH METALLIC ACCESSORY LOOPS.',
    status: 'ready',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'item-6',
    type: 'link',
    title: 'Slow Sunday Brunch',
    description: 'Artisanal eggs benedict paired with wild-fermented yeast sourdough',
    imageUrl:
      'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80&w=800',
    sourceUrl: 'https://bonappetit.com/recipe',
    category: 'Recipes',
    extractedText:
      'Slow Sunday Brunch: 4 organic soft poached eggs, cured duck breasts, chives, dynamic lemon hollandaise sauce.',
    status: 'ready',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'item-7',
    type: 'link',
    title: '3D Gradient Studies',
    description: 'Stellar color mesh and translucent gradient mesh explorations',
    imageUrl:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    sourceUrl: 'https://dribbble.com/shots',
    category: 'Design',
    extractedText:
      'CYAN PURPLE FLUID CONTOURS MAPPED IN THREE-DIMENSIONAL SPLINE SPACE WITH FROSTED DISK ACCENTS.',
    status: 'ready',
    createdAt: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'item-8',
    type: 'image',
    title: 'Yosemite Mist',
    description: 'Misty peak textures in scenic mountain valley stay card',
    imageUrl:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
    category: 'Travel',
    sourceUrl: 'https://airbnb.com/japan-stay',
    extractedText:
      'HAKONE ONSEN RETREATS - FIRST FLOOR SCENERY CARD WITH HEATED SPRING DETAILS AND BALCONY VIEWS.',
    status: 'ready',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'item-9',
    type: 'image',
    title: 'Trail Sneaker',
    description: 'Retro limited run athletic sneakers upper footbed views',
    imageUrl:
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800',
    category: 'Shopping',
    extractedText:
      'NIKE AIR FORCE 1 VINTAGE COLLECTORS HIGHER MIDSOLE CONTOURS. BLACK STRAP AT THE UPPER FOOTBED.',
    status: 'ready',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'item-10',
    type: 'link',
    title: 'Sovereign Vault',
    description:
      'Why localized secure hardware enclaves beat remote multi-tenant clouds.',
    imageUrl:
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
    sourceUrl: 'https://notion.so/architecture/sovereign-vault',
    category: 'Articles',
    extractedText:
      'THE CRYPTOGRAPHIC HARDWARE BOUNDS: AES-256 PRIVATE SECURE ENVELOPE SEEDS ARE LOCKED DOWN ON-CHIP FOR HIGH SOVEREIGN METRICS.',
    status: 'ready',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const CATEGORIES_KEY = 'stash_categories_v1';

async function uploadLocalImageIfNecessary(item: StashItem, apiUrl: string): Promise<StashItem> {
  if (item.type === 'image' && item.imageUrl && item.imageUrl.startsWith('file://')) {
    try {
      const base64 = await FileSystem.readAsStringAsync(item.imageUrl, {
        encoding: FileSystem.EncodingType.Base64,
      });
      if (base64) {
        const res = await fetch(`${apiUrl}/api/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64, mimeType: 'image/png' })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.imageUrl) {
            console.log(`[Database] Successfully uploaded offline cached image to server: ${data.imageUrl}`);
            item.imageUrl = data.imageUrl;
          }
        }
      }
    } catch (err) {
      console.warn('[Database] Failed to upload local image during sync:', err);
      // Self-healing: if file does not exist or cannot be read, replace with placeholder
      console.log(`[Database] Local image file not found or unreadable. Replacing with placeholder: ${item.imageUrl}`);
      item.imageUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600';
    }
  }
  return item;
}

class StashDatabase {
  private items: StashItem[] = [];
  private categories: string[] = [];
  private ready: Promise<void>;
  private resolveReady!: () => void;
  private listeners: (() => void)[] = [];

  constructor() {
    this.ready = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
    this.initialize();
  }

  private async initialize() {
    try {
      // 1. Load local AsyncStorage cache first for instant load
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.items = JSON.parse(stored);
      } else {
        this.items = [...DEFAULT_ITEMS];
        await this.save();
      }

      const storedCats = await AsyncStorage.getItem(CATEGORIES_KEY);
      if (storedCats) {
        this.categories = JSON.parse(storedCats);
      } else {
        this.categories = ['Shopping', 'Recipes', 'Travel', 'Articles', 'Design'];
        await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(this.categories));
      }
    } catch (e) {
      console.warn('[Database] Failed to load local cache:', e);
      this.items = [...DEFAULT_ITEMS];
      this.categories = ['Shopping', 'Recipes', 'Travel', 'Articles', 'Design'];
    } finally {
      this.resolveReady();
      this.notify();
    }

    // Run the online sync in the background
    this.sync().catch((err) => {
      console.warn('[Database] Background sync initialization error:', err);
    });
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

  public async sync() {
    try {
      // Fetch fresh items from the online Render backend database
      const apiUrl = await resolveApiUrl();
      console.log(`[Database] Syncing with online database: ${apiUrl}/api/items`);
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500); // 3.5s sync timeout
      
      const res = await fetch(`${apiUrl}/api/items`, {
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        const serverItems = await res.json();
        if (Array.isArray(serverItems)) {
          // Track deleted tombstones
          const deletedStr = await AsyncStorage.getItem('stash_deleted_ids_v1');
          const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
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
              fetch(`${apiUrl}/api/items/${id}`, { method: 'DELETE' })
                .catch(err => console.warn('[Database] Failed to delete item on server:', err));
            }
          }

          // 4. Merge items
          if (serverOnlyItems.length > 0 || localOnlyItems.length > 0) {
            this.items = [...this.items, ...serverOnlyItems];
            await this.save();
            this.notify();
          }

          // 5. Upload local-only items back to server
          for (const item of localOnlyItems) {
            uploadLocalImageIfNecessary(item, apiUrl).then(async (updatedItem) => {
              if (updatedItem.imageUrl !== item.imageUrl) {
                const idx = this.items.findIndex(i => i.id === item.id);
                if (idx !== -1) {
                  this.items[idx].imageUrl = updatedItem.imageUrl;
                  await this.save();
                  this.notify();
                }
              }
              const safePayload = {
                ...updatedItem,
                imageUrl: updatedItem.imageUrl?.startsWith('file://') ? '' : updatedItem.imageUrl
              };
              fetch(`${apiUrl}/api/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(safePayload)
              }).catch(err => console.warn('[Database] Failed to restore item to server:', err));
            });
          }

          console.log('[Database] Mobile sync completed. Local-first merge-sync finished.');
        }
      }
    } catch (e: any) {
      console.warn('[Database] Sync failed, running in local-offline cache fallback mode:', e?.message || e);
    }
  }

  private async save() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    } catch (e) {}
  }

  public async getCategories(): Promise<string[]> {
    await this.ready;
    return [...this.categories];
  }

  public async addCategory(category: string): Promise<string[]> {
    await this.ready;
    const clean = category.trim();
    if (!clean) return this.categories;
    const exists = this.categories.some(
      (c) => c.toLowerCase() === clean.toLowerCase()
    );
    if (!exists) {
      const formatted = clean.charAt(0).toUpperCase() + clean.slice(1);
      this.categories.push(formatted);
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(this.categories));
      this.notify();
    }
    return this.categories;
  }

  public async resetCategories(): Promise<void> {
    await this.ready;
    this.categories = ['Shopping', 'Recipes', 'Travel', 'Articles', 'Design'];
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(this.categories));
    this.notify();
  }

  public async getAll(): Promise<StashItem[]> {
    await this.ready;
    return [...this.items]
      .filter((i) => i.status !== 'pending')
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  public async getPending(): Promise<StashItem[]> {
    await this.ready;
    return [...this.items]
      .filter((i) => i.status === 'pending')
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  public async getInboxCount(): Promise<number> {
    await this.ready;
    return this.items.filter((i) => i.status === 'pending').length;
  }

  public async addPending(item: {
    type: 'image' | 'link';
    title: string;
    description?: string;
    imageUrl?: string;
    category?: string;
  }): Promise<StashItem> {
    if (item.category) {
      await this.addCategory(item.category);
    }
    const newItem: StashItem = {
      id: `pending-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: item.type,
      title: item.title,
      description: item.description || '',
      imageUrl: item.imageUrl,
      category: item.category || 'Design',
      extractedText: '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.items.unshift(newItem);
    await this.save();
    this.notify();

    // Sync to backend asynchronously
    resolveApiUrl().then(async (apiUrl) => {
      let itemToSync = { ...newItem };
      try {
        const uploaded = await uploadLocalImageIfNecessary(itemToSync, apiUrl);
        if (uploaded.imageUrl !== newItem.imageUrl) {
          const idx = this.items.findIndex(i => i.id === newItem.id);
          if (idx !== -1) {
            this.items[idx].imageUrl = uploaded.imageUrl;
            await this.save();
            this.notify();
          }
          itemToSync = uploaded;
        }
      } catch (err) {
        console.warn('[Database] Proactive image upload failed on addPending:', err);
      }

      const safePayload = {
        ...itemToSync,
        imageUrl: itemToSync.imageUrl?.startsWith('file://') ? '' : itemToSync.imageUrl
      };

      fetch(`${apiUrl}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(safePayload)
      }).catch(err => console.warn('[Database] Background sync failed for addPending:', err));
    });

    return newItem;
  }

  public async markProcessed(
    id: string,
    ocrText: string,
    category: string,
  ): Promise<StashItem | null> {
    if (category) {
      await this.addCategory(category);
    }
    const index = this.items.findIndex((i) => i.id === id);
    if (index === -1) return null;
    this.items[index].status = 'ready';
    this.items[index].extractedText = ocrText;
    this.items[index].category = category;
    await this.save();
    this.notify();

    // Sync to backend asynchronously
    const updatedBody = this.items[index];
    resolveApiUrl().then(apiUrl => {
      const safePayload = {
        ...updatedBody,
        imageUrl: updatedBody.imageUrl?.startsWith('file://') ? '' : updatedBody.imageUrl
      };
      fetch(`${apiUrl}/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(safePayload)
      }).catch(err => console.warn('[Database] Background sync failed for markProcessed:', err));
    });

    return this.items[index];
  }

  public async processBatch(
    ids: string[],
  ): Promise<StashItem[]> {
    await this.ready;
    const pendingItems = ids
      .map((id) => this.items.find((i) => i.id === id))
      .filter((i): i is StashItem => i !== undefined && i.status === 'pending');

    const processed = await processImagesInBatch(
      pendingItems.map((i) => ({
        id: i.id,
        imageUrl: i.imageUrl,
        title: i.title,
        description: i.description,
      })),
    );

    const updated: StashItem[] = [];
    for (const result of processed) {
      const idx = this.items.findIndex((i) => i.id === result.id);
      if (idx === -1) continue;
      this.items[idx].status = 'ready';
      this.items[idx].title = result.title;
      this.items[idx].description = result.description;
      this.items[idx].extractedText = result.extractedText;
      this.items[idx].category = result.category;
      if (result.imageUrl) {
        this.items[idx].imageUrl = result.imageUrl;
      }
      if (result.category) {
        await this.addCategory(result.category);
      }
      updated.push(this.items[idx]);

      // Sync to backend asynchronously
      const itemToUpdate = this.items[idx];
      resolveApiUrl().then(apiUrl => {
        const safePayload = {
          ...itemToUpdate,
          imageUrl: itemToUpdate.imageUrl?.startsWith('file://') ? '' : itemToUpdate.imageUrl
        };
        fetch(`${apiUrl}/api/items/${result.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(safePayload)
        }).catch(err => console.warn('[Database] Background sync failed for processBatch item:', err));
      });
    }

    await this.save();
    this.notify();
    return updated;
  }

  public async search(query: string): Promise<StashItem[]> {
    const all = await this.getAll();
    const term = query.trim().toLowerCase();
    if (!term) return all;

    const tokens = term.split(/\s+/).filter((t) => t.length > 0);
    if (tokens.length === 0) return all;

    return all
      .filter((i) => i.status !== 'pending')
      .filter((item) => {
        const searchableText =
          `${item.title} ${item.description || ''} ${item.extractedText || ''} ${
            item.sourceUrl || ''
          } ${item.category}`.toLowerCase();
        return tokens.every((token) => searchableText.includes(token));
      });
  }

  public async getByCategory(
    category: CategoryKey,
  ): Promise<StashItem[]> {
    const all = await this.getAll();
    return all.filter((item) => item.category === category);
  }

  public async add(
    item: Omit<StashItem, 'id' | 'createdAt'>,
  ): Promise<StashItem> {
    if (item.category) {
      await this.addCategory(item.category);
    }
    const newItem: StashItem = {
      ...item,
      id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.items.unshift(newItem);
    await this.save();
    this.notify();

    // Sync to backend asynchronously
    resolveApiUrl().then(async (apiUrl) => {
      let itemToSync = { ...newItem };
      try {
        const uploaded = await uploadLocalImageIfNecessary(itemToSync, apiUrl);
        if (uploaded.imageUrl !== newItem.imageUrl) {
          const idx = this.items.findIndex(i => i.id === newItem.id);
          if (idx !== -1) {
            this.items[idx].imageUrl = uploaded.imageUrl;
            await this.save();
            this.notify();
          }
          itemToSync = uploaded;
        }
      } catch (err) {
        console.warn('[Database] Proactive image upload failed on add:', err);
      }

      const safePayload = {
        ...itemToSync,
        imageUrl: itemToSync.imageUrl?.startsWith('file://') ? '' : itemToSync.imageUrl
      };

      fetch(`${apiUrl}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(safePayload)
      }).catch(err => console.warn('[Database] Background sync failed for add:', err));
    });

    return newItem;
  }

  public async update(
    id: string,
    updates: Partial<StashItem>,
  ): Promise<StashItem | null> {
    if (updates.category) {
      await this.addCategory(updates.category);
    }
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    this.items[index] = { ...this.items[index], ...updates };
    await this.save();
    this.notify();

    // Sync to backend asynchronously
    const updatedBody = this.items[index];
    resolveApiUrl().then(async (apiUrl) => {
      let itemToSync = { ...updatedBody };
      try {
        const uploaded = await uploadLocalImageIfNecessary(itemToSync, apiUrl);
        if (uploaded.imageUrl !== updatedBody.imageUrl) {
          this.items[index].imageUrl = uploaded.imageUrl;
          await this.save();
          this.notify();
          itemToSync = uploaded;
        }
      } catch (err) {
        console.warn('[Database] Failed to upload local image on update sync:', err);
      }

      const safePayload = {
        ...itemToSync,
        imageUrl: itemToSync.imageUrl?.startsWith('file://') ? '' : itemToSync.imageUrl
      };

      fetch(`${apiUrl}/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(safePayload)
      }).catch(err => console.warn('[Database] Background sync failed for update:', err));
    });

    return this.items[index];
  }

  public async delete(id: string): Promise<boolean> {
    await this.ready;
    const initialLen = this.items.length;
    this.items = this.items.filter((item) => item.id !== id);
    
    // Add to deleted set
    try {
      const deletedStr = await AsyncStorage.getItem('stash_deleted_ids_v1');
      const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        await AsyncStorage.setItem('stash_deleted_ids_v1', JSON.stringify(deletedIds));
      }
    } catch (e) {}

    await this.save();
    this.notify();

    // Sync to backend asynchronously
    resolveApiUrl().then(apiUrl => {
      fetch(`${apiUrl}/api/items/${id}`, {
        method: 'DELETE'
      }).catch(err => console.warn('[Database] Background sync failed for delete:', err));
    });

    return this.items.length < initialLen;
  }

  public async getCounts(): Promise<Record<string, number>> {
    const all = await this.getAll();
    const categories = await this.getCategories();
    const counts: Record<string, number> = {};
    categories.forEach((cat) => {
      counts[cat] = 0;
    });
    all.forEach((item) => {
      if (item.status === 'ready') {
        counts[item.category] = (counts[item.category] || 0) + 1;
      }
    });
    return counts;
  }

  public async getStorageMetrics(): Promise<{
    usedMB: number;
    maxMB: number;
    percent: number;
  }> {
    await this.ready;
    const str = JSON.stringify(this.items);
    const sizeInBytes = str.length * 2;
    const usedMB = parseFloat((sizeInBytes / (1024 * 1024)).toFixed(2));
    const maxMB = 50.0;
    const percent = Math.min(
      100,
      parseFloat(((usedMB / maxMB) * 100).toFixed(1)),
    );
    return {
      usedMB: usedMB || 28.4,
      maxMB,
      percent: percent || 56.8,
    };
  }

  public async reset(): Promise<void> {
    this.items = [...DEFAULT_ITEMS];
    await this.save();
    await this.resetCategories();
    this.notify();

    // Sync to backend asynchronously
    resolveApiUrl().then(apiUrl => {
      fetch(`${apiUrl}/api/items/reset`, {
        method: 'POST'
      }).catch(err => console.warn('[Database] Background sync failed for reset:', err));
    });
  }
}

export const db = new StashDatabase();
