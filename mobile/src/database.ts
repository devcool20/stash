import AsyncStorage from '@react-native-async-storage/async-storage';
import { StashItem, CategoryKey } from './types';
import { processImagesInBatch, resolveApiUrl } from './processing';
import { autoCategorize } from './categories';
import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';


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

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  const cleanBase64 = base64.replace(/[^A-Za-z0-9\+\/]/g, '');
  const len = cleanBase64.length;
  const bufferLength = Math.floor(len * 0.75);
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arrayBuffer);

  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const encoded1 = lookup[cleanBase64.charCodeAt(i)] || 0;
    const encoded2 = lookup[cleanBase64.charCodeAt(i + 1)] || 0;
    const encoded3 = lookup[cleanBase64.charCodeAt(i + 2)] || 0;
    const encoded4 = lookup[cleanBase64.charCodeAt(i + 3)] || 0;

    if (p < bufferLength) {
      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    }
    if (p < bufferLength) {
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    }
    if (p < bufferLength) {
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }
  }

  return arrayBuffer;
}

async function uploadLocalImageIfNecessary(item: StashItem, userId: string): Promise<StashItem> {
  if (item.type === 'image' && item.imageUrl && item.imageUrl.startsWith('file://')) {
    try {
      // 1. Check if local file exists first
      const fileInfo = await FileSystem.getInfoAsync(item.imageUrl);
      if (!fileInfo.exists) {
        console.warn(`[Database] Local file not found: ${item.imageUrl}. Replacing with placeholder.`);
        item.imageUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600';
        return item;
      }

      // 2. Read file as Base64
      const base64 = await FileSystem.readAsStringAsync(item.imageUrl, {
        encoding: FileSystem.EncodingType.Base64,
      });
      if (!base64) {
        throw new Error('Base64 read returned empty content');
      }

      // 3. Upload to Supabase Storage
      const arrayBuffer = base64ToArrayBuffer(base64);
      const fileExt = 'png';
      const filePath = `${userId}/${item.id}.${fileExt}`;
      
      const { data, error } = await supabase.storage
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
        const oldUrl = item.imageUrl;
        item.imageUrl = urlData.publicUrl;

        // Delete local persistent file to save space
        try {
          await FileSystem.deleteAsync(oldUrl, { idempotent: true });
          console.log(`[Database] Deleted local cache file after successful upload: ${oldUrl}`);
        } catch (delErr) {
          console.warn('[Database] Failed to delete local cache file:', delErr);
        }
      }
    } catch (err: any) {
      console.warn('[Database] Failed to upload local image to Supabase Storage:', err?.message || err);
      // DO NOT replace with placeholder on network/API errors!
      // Only replace if it is confirmed that the file itself cannot be read.
      try {
        const fileInfo = await FileSystem.getInfoAsync(item.imageUrl);
        if (!fileInfo.exists) {
          console.log(`[Database] File confirmed missing on upload failure. Replacing with placeholder.`);
          item.imageUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600';
        }
      } catch (checkErr) {
        // Safe fallback if even getInfoAsync throws
        item.imageUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600';
      }
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
  private currentUserId: string | null = null;

  constructor() {
    this.ready = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
    this.initialize();
  }

  private async initialize() {
    try {
      // Get current auth session from Supabase (may be null if not hydrated yet)
      let { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If session is null, wait up to 1000ms for the auth state to hydrate from AsyncStorage
        await Promise.race([
          new Promise<void>((resolve) => {
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
              if (currentSession) {
                session = currentSession;
              }
              subscription.unsubscribe();
              resolve();
            });
          }),
          new Promise<void>((resolve) => setTimeout(resolve, 1000))
        ]);
      }

      this.currentUserId = session?.user?.id || null;
      
      // Load current user's items from cache
      await this.loadItemsForCurrentUser();

      // Heal any unreadable or missing file:// images in local cache
      const placeholder = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600';
      let healed = false;
      for (const item of this.items) {
        if (item.type === 'image') {
          if (!item.imageUrl) {
            item.imageUrl = placeholder;
            healed = true;
          } else if (item.imageUrl.startsWith('file://')) {
            try {
              const info = await FileSystem.getInfoAsync(item.imageUrl);
              if (!info.exists) {
                console.log(`[Database] Healing missing local file on init: ${item.imageUrl}`);
                item.imageUrl = placeholder;
                healed = true;
              }
            } catch (err) {
              item.imageUrl = placeholder;
              healed = true;
            }
          }
        }
      }
      if (healed) {
        await this.save();
      }
    } catch (e) {
      console.warn('[Database] Failed to load local cache:', e);
      this.items = this.currentUserId ? [] : [...DEFAULT_ITEMS];
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

  private getStorageKey(): string {
    return this.currentUserId ? `stash_items_${this.currentUserId}` : 'stash_items_v1';
  }

  private getCategoriesKey(): string {
    return this.currentUserId ? `stash_categories_${this.currentUserId}` : 'stash_categories_v1';
  }

  private getDeletedKey(): string {
    return this.currentUserId ? `stash_deleted_ids_${this.currentUserId}` : 'stash_deleted_ids_v1';
  }

  private async loadItemsForCurrentUser() {
    try {
      const key = this.getStorageKey();
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        this.items = JSON.parse(stored);
      } else {
        if (this.currentUserId) {
          this.items = [];
        } else {
          this.items = [...DEFAULT_ITEMS];
        }
        await this.save();
      }

      const catsKey = this.getCategoriesKey();
      const storedCats = await AsyncStorage.getItem(catsKey);
      if (storedCats) {
        this.categories = JSON.parse(storedCats);
      } else {
        this.categories = ['Shopping', 'Recipes', 'Travel', 'Articles', 'Design'];
        await AsyncStorage.setItem(catsKey, JSON.stringify(this.categories));
      }
    } catch (e) {
      console.warn('[Database] Failed to load user cache:', e);
      this.items = this.currentUserId ? [] : [...DEFAULT_ITEMS];
      this.categories = ['Shopping', 'Recipes', 'Travel', 'Articles', 'Design'];
    }
  }

  public async setUserId(userId: string | null) {
    if (this.currentUserId === userId) return;
    this.currentUserId = userId;
    await this.loadItemsForCurrentUser();
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

  public async sync() {
    try {
      await this.ready;
      const userId = this.currentUserId;
      if (!userId) {
        console.log('[Database] No active Supabase session. Skipping online sync.');
        return;
      }
      
      console.log(`[Database] Syncing with Supabase for user: ${userId}`);
      this.notify();
      
      // Fetch fresh items from Supabase items table
      const { data: serverItems, error: fetchError } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', userId);

      if (fetchError) {
        throw fetchError;
      }

      if (Array.isArray(serverItems)) {
        // Track deleted tombstones
        const deletedKey = this.getDeletedKey();
        const deletedStr = await AsyncStorage.getItem(deletedKey);
        const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
        const deletedSet = new Set(deletedIds);

        const serverIds = new Set(serverItems.map(i => i.id));
        const localIds = new Set(this.items.map(i => i.id));

        // 1. Local-only items to upload to server
        const localOnlyItems = this.items.filter(i => !serverIds.has(i.id));

        // 2. Server-only items not in cache and not deleted
        const serverOnlyItems = serverItems.filter(i => !localIds.has(i.id) && !deletedSet.has(i.id));

        // 3. Delete any items on server that have local tombstones
        for (const id of deletedIds) {
          if (serverIds.has(id)) {
            const { error: deleteError } = await supabase
              .from('items')
              .delete()
              .eq('id', id)
              .eq('user_id', userId);
            if (deleteError) {
              console.warn('[Database] Failed to delete item on Supabase during sync:', deleteError);
            }
          }
        }

        // 4. Merge server-only items into local cache
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

        // 4.5. Reconcile matching items (exist in both server and local)
        for (const serverItem of serverItems) {
          const localItem = this.items.find(i => i.id === serverItem.id);
          if (localItem) {
            const localIsReady = localItem.status === 'ready';
            const serverIsReady = serverItem.status === 'ready';
            
            const localHasRealTitle = localItem.title !== 'Screen Capture' && localItem.title !== 'Web Node';
            const serverHasRealTitle = serverItem.title !== 'Screen Capture' && serverItem.title !== 'Web Node';
            
            if (localIsReady && (!serverIsReady || (!serverHasRealTitle && localHasRealTitle))) {
              // Local is more complete -> Update server
              console.log(`[Database] Sync: Updating server item ${localItem.id} with more complete local details`);
              uploadLocalImageIfNecessary(localItem, userId).then(async (updatedItem) => {
                const { error: updateError } = await supabase
                  .from('items')
                  .update({
                    title: updatedItem.title,
                    description: updatedItem.description || '',
                    imageUrl: updatedItem.imageUrl || '',
                    sourceUrl: updatedItem.sourceUrl || '',
                    favicon: updatedItem.favicon || '',
                    category: updatedItem.category,
                    extractedText: updatedItem.extractedText || '',
                    summary: updatedItem.summary || '',
                    status: updatedItem.status,
                  })
                  .eq('id', updatedItem.id)
                  .eq('user_id', userId);
                if (updateError) {
                  console.warn('[Database] Failed to update server item during sync:', updateError);
                }
              });
            } else if (serverIsReady && (!localIsReady || (!localHasRealTitle && serverHasRealTitle))) {
              // Server is more complete -> Update local cache
              console.log(`[Database] Sync: Updating local item ${localItem.id} with more complete server details`);
              localItem.title = serverItem.title;
              localItem.description = serverItem.description || '';
              localItem.imageUrl = serverItem.imageUrl || '';
              localItem.sourceUrl = serverItem.sourceUrl || '';
              localItem.favicon = serverItem.favicon || '';
              localItem.category = serverItem.category;
              localItem.extractedText = serverItem.extractedText || '';
              localItem.summary = serverItem.summary || '';
              localItem.status = serverItem.status as any;
              localItem.createdAt = serverItem.createdAt;
              merged = true;
            }
          }
        }

        // Clean/heal any new items
        const placeholder = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600';
        let changed = false;
        for (const item of this.items) {
          if (item.type === 'image') {
            if (!item.imageUrl) {
              item.imageUrl = placeholder;
              changed = true;
            } else if (item.imageUrl.startsWith('file://')) {
              try {
                const info = await FileSystem.getInfoAsync(item.imageUrl);
                if (!info.exists) {
                  item.imageUrl = placeholder;
                  changed = true;
                }
              } catch {
                item.imageUrl = placeholder;
                changed = true;
              }
            }
          }
        }
        
        if (merged || changed) {
          await this.save();
          this.notify();
        }

        // 5. Upload local-only items back to server
        for (const item of localOnlyItems) {
          uploadLocalImageIfNecessary(item, userId).then(async (updatedItem) => {
            if (updatedItem.imageUrl !== item.imageUrl) {
              const idx = this.items.findIndex(i => i.id === item.id);
              if (idx !== -1) {
                this.items[idx].imageUrl = updatedItem.imageUrl;
                await this.save();
                this.notify();
              }
            }
            
            const { error: insertError } = await supabase.from('items').insert({
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
            if (insertError) {
              console.warn('[Database] Failed to restore item to Supabase:', insertError);
            }
          });
        }

        console.log('[Database] Supabase sync completed.');
      }
    } catch (e: any) {
      console.warn('[Database] Supabase sync failed, running in local-offline cache fallback mode:', e?.message || e);
    }
  }

  private async save() {
    try {
      const key = this.getStorageKey();
      await AsyncStorage.setItem(key, JSON.stringify(this.items));
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
      const catsKey = this.getCategoriesKey();
      await AsyncStorage.setItem(catsKey, JSON.stringify(this.categories));
      this.notify();
    }
    return this.categories;
  }

  public async resetCategories(): Promise<void> {
    await this.ready;
    this.categories = ['Shopping', 'Recipes', 'Travel', 'Articles', 'Design'];
    const catsKey = this.getCategoriesKey();
    await AsyncStorage.setItem(catsKey, JSON.stringify(this.categories));
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

    // Sync to Supabase asynchronously
    const userId = this.currentUserId;
    if (userId) {
      (async () => {
        let itemToSync = { ...newItem };
        try {
          const uploaded = await uploadLocalImageIfNecessary(itemToSync, userId);
          if (uploaded.imageUrl !== newItem.imageUrl) {
            const idx = this.items.findIndex(i => i.id === newItem.id);
            if (idx !== -1) {
              this.items[idx].imageUrl = uploaded.imageUrl;
              await this.save();
              this.notify();
            }
            itemToSync = uploaded;
          }

          const { error } = await supabase.from('items').insert({
            id: itemToSync.id,
            user_id: userId,
            type: itemToSync.type,
            title: itemToSync.title,
            description: itemToSync.description || '',
            imageUrl: itemToSync.imageUrl || '',
            sourceUrl: itemToSync.sourceUrl || '',
            favicon: itemToSync.favicon || '',
            category: itemToSync.category,
            extractedText: itemToSync.extractedText || '',
            summary: itemToSync.summary || '',
            status: itemToSync.status,
            createdAt: itemToSync.createdAt,
          });
          if (error) throw error;
        } catch (err) {
          console.warn('[Database] Background sync failed for addPending:', err);
        }
      })();
    }

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

    const updatedBody = this.items[index];
    const userId = this.currentUserId;
    if (userId) {
      (async () => {
        try {
          const { error } = await supabase
            .from('items')
            .update({
              status: 'ready',
              extractedText: ocrText,
              category: category,
            })
            .eq('id', id)
            .eq('user_id', userId);
          if (error) throw error;
        } catch (err) {
          console.warn('[Database] Background sync failed for markProcessed:', err);
        }
      })();
    }

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
    const userId = this.currentUserId;

    for (const result of processed) {
      const idx = this.items.findIndex((i) => i.id === result.id);
      if (idx === -1) continue;
      this.items[idx].status = 'ready';
      this.items[idx].title = result.title;
      this.items[idx].description = result.description;
      this.items[idx].extractedText = result.extractedText;
      this.items[idx].category = result.category;
      if (result.imageUrl && this.items[idx].type === 'link') {
        this.items[idx].imageUrl = result.imageUrl;
      }
      if (result.category) {
        await this.addCategory(result.category);
      }
      updated.push(this.items[idx]);

      // Sync to Supabase asynchronously
      if (userId) {
        const itemToUpdate = this.items[idx];
        (async () => {
          try {
            let finalItem = { ...itemToUpdate };
            const uploaded = await uploadLocalImageIfNecessary(finalItem, userId);
            if (uploaded.imageUrl !== itemToUpdate.imageUrl) {
              const currentIdx = this.items.findIndex(i => i.id === itemToUpdate.id);
              if (currentIdx !== -1) {
                this.items[currentIdx].imageUrl = uploaded.imageUrl;
                await this.save();
                this.notify();
              }
              finalItem = uploaded;
            }

            const { error } = await supabase
              .from('items')
              .update({
                title: finalItem.title,
                description: finalItem.description || '',
                extractedText: finalItem.extractedText || '',
                category: finalItem.category,
                status: 'ready',
                imageUrl: finalItem.imageUrl || '',
              })
              .eq('id', finalItem.id)
              .eq('user_id', userId);
            if (error) throw error;
          } catch (err) {
            console.warn('[Database] Background sync failed for processBatch item:', err);
          }
        })();
      }
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

    const userId = this.currentUserId;
    if (userId) {
      (async () => {
        let itemToSync = { ...newItem };
        try {
          const uploaded = await uploadLocalImageIfNecessary(itemToSync, userId);
          if (uploaded.imageUrl !== newItem.imageUrl) {
            const idx = this.items.findIndex(i => i.id === newItem.id);
            if (idx !== -1) {
              this.items[idx].imageUrl = uploaded.imageUrl;
              await this.save();
              this.notify();
            }
            itemToSync = uploaded;
          }

          const { error } = await supabase.from('items').insert({
            id: itemToSync.id,
            user_id: userId,
            type: itemToSync.type,
            title: itemToSync.title,
            description: itemToSync.description || '',
            imageUrl: itemToSync.imageUrl || '',
            sourceUrl: itemToSync.sourceUrl || '',
            favicon: itemToSync.favicon || '',
            category: itemToSync.category,
            extractedText: itemToSync.extractedText || '',
            summary: itemToSync.summary || '',
            status: itemToSync.status,
            createdAt: itemToSync.createdAt,
          });
          if (error) throw error;
        } catch (err) {
          console.warn('[Database] Background sync failed for add:', err);
        }
      })();
    }

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

    const updatedBody = this.items[index];
    const userId = this.currentUserId;
    if (userId) {
      (async () => {
        let itemToSync = { ...updatedBody };
        try {
          const uploaded = await uploadLocalImageIfNecessary(itemToSync, userId);
          if (uploaded.imageUrl !== updatedBody.imageUrl) {
            this.items[index].imageUrl = uploaded.imageUrl;
            await this.save();
            this.notify();
            itemToSync = uploaded;
          }

          const { error } = await supabase
            .from('items')
            .update({
              title: itemToSync.title,
              description: itemToSync.description || '',
              imageUrl: itemToSync.imageUrl || '',
              sourceUrl: itemToSync.sourceUrl || '',
              favicon: itemToSync.favicon || '',
              category: itemToSync.category,
              extractedText: itemToSync.extractedText || '',
              summary: itemToSync.summary || '',
              status: itemToSync.status,
            })
            .eq('id', id)
            .eq('user_id', userId);
          if (error) throw error;
        } catch (err) {
          console.warn('[Database] Background sync failed for update:', err);
        }
      })();
    }

    return this.items[index];
  }

  public async delete(id: string): Promise<boolean> {
    await this.ready;
    const initialLen = this.items.length;
    this.items = this.items.filter((item) => item.id !== id);

    const deletedKey = this.getDeletedKey();
    try {
      const deletedStr = await AsyncStorage.getItem(deletedKey);
      const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        await AsyncStorage.setItem(deletedKey, JSON.stringify(deletedIds));
      }
    } catch (e) {}

    await this.save();
    this.notify();

    const userId = this.currentUserId;
    if (userId) {
      (async () => {
        try {
          const { error } = await supabase
            .from('items')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);
          if (error) throw error;
        } catch (err) {
          console.warn('[Database] Background sync failed for delete:', err);
        }
      })();
    }

    return this.items.length < initialLen;
  }

  public async deleteBatch(ids: string[]): Promise<boolean> {
    await this.ready;
    if (ids.length === 0) return false;
    const initialLen = this.items.length;
    const idSet = new Set(ids);
    this.items = this.items.filter((item) => !idSet.has(item.id));

    const deletedKey = this.getDeletedKey();
    try {
      const deletedStr = await AsyncStorage.getItem(deletedKey);
      const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
      let changed = false;
      for (const id of ids) {
        if (!deletedIds.includes(id)) {
          deletedIds.push(id);
          changed = true;
        }
      }
      if (changed) {
        await AsyncStorage.setItem(deletedKey, JSON.stringify(deletedIds));
      }
    } catch (e) {}

    await this.save();
    this.notify();

    const userId = this.currentUserId;
    if (userId) {
      (async () => {
        try {
          const { error } = await supabase
            .from('items')
            .delete()
            .in('id', ids)
            .eq('user_id', userId);
          if (error) throw error;
        } catch (err) {
          console.warn('[Database] Background sync failed for deleteBatch:', err);
        }
      })();
    }

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
      usedMB: usedMB || 0,
      maxMB,
      percent: percent || 0,
    };
  }

  public async reset(): Promise<void> {
    if (this.currentUserId) {
      this.items = [];
    } else {
      this.items = [...DEFAULT_ITEMS];
    }
    await this.save();
    await this.resetCategories();
    this.notify();

    const userId = this.currentUserId;
    if (userId) {
      (async () => {
        try {
          const { error } = await supabase
            .from('items')
            .delete()
            .eq('user_id', userId);
          if (error) throw error;
        } catch (err) {
          console.warn('[Database] Background sync failed for reset:', err);
        }
      })();
    }
  }
}

export const db = new StashDatabase();

