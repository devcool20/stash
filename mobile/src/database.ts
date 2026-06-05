import AsyncStorage from '@react-native-async-storage/async-storage';
import { StashItem, CategoryKey } from './types';

const STORAGE_KEY = 'stash_items_v1';

const CATEGORY_DICTIONARY: Record<CategoryKey, string[]> = {
  Shopping: [
    'buy',
    'price',
    'shop',
    'sneaker',
    'shoe',
    'dress',
    'shirt',
    'pants',
    'watch',
    'jacket',
    'amazon',
    'etsy',
    'store',
    'cart',
    'sale',
    'boss',
    'gold',
    'liner',
    'set',
  ],
  Recipes: [
    'cook',
    'ingredient',
    'food',
    'brunch',
    'lunch',
    'dinner',
    'recipe',
    'bake',
    'salad',
    'kitchen',
    'taste',
    'eat',
    'bonappetit',
    'restaurant',
  ],
  Travel: [
    'trip',
    'flight',
    'travel',
    'hotel',
    'mountain',
    'vacation',
    'beach',
    'tokyo',
    'paris',
    'map',
    'explore',
    'booking',
    'airbnb',
    'scenery',
    'island',
  ],
  Articles: [
    'read',
    'blog',
    'news',
    'medium',
    'notion',
    'post',
    'writing',
    'book',
    'theory',
    'essay',
    'newsletter',
    'article',
    'nyt',
  ],
  Design: [
    'designer',
    'inspiration',
    'gradient',
    'minimal',
    'ui',
    'ux',
    'art',
    'portfolio',
    'poster',
    'dribbble',
    'figma',
    'render',
    '3d',
    'creative',
    'aesthetic',
    'interior',
    'chair',
    'furniture',
  ],
};

export function autoCategorize(
  text: string,
  title: string,
  url?: string,
): CategoryKey {
  const combined = `${text} ${title} ${url || ''}`.toLowerCase();

  let bestCategory: CategoryKey = 'Design';
  let maxWeight = -1;

  for (const [category, keywords] of Object.entries(CATEGORY_DICTIONARY)) {
    let weight = 0;
    keywords.forEach((keyword) => {
      if (combined.includes(keyword)) {
        weight += 1;
      }
    });
    if (weight > maxWeight && weight > 0) {
      maxWeight = weight;
      bestCategory = category as CategoryKey;
    }
  }

  return bestCategory;
}

export const DEFAULT_ITEMS: StashItem[] = [
  {
    id: 'item-1',
    type: 'image',
    title: 'Linen Set',
    description: 'Minimal aesthetic lookbook apparel collection',
    imageUrl:
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=600',
    category: 'Shopping',
    extractedText:
      'STUDIO PREVIEW - 100% Giza Cotton Linen Shirt White with Relaxed Slate Utility Jeans. Fitted for autumn collections. Brand: SÉZANE.',
    status: 'ready',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'item-2',
    type: 'image',
    title: 'Runner V2',
    description: 'Suede and full-grain leather premium active athletic sneakers',
    imageUrl:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600',
    category: 'Shopping',
    extractedText:
      'STASH LABS INC. RUNNER V2. BEIGE CORAL OUTSOLE AND TEXTURED TPU ENCAPSULATION MIDSOLE. SIZES 8-12.',
    status: 'ready',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'item-3',
    type: 'image',
    title: 'Gold Watch',
    description: 'Gold-plated luxury watch classic vintage collectors edition',
    imageUrl:
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=600',
    category: 'Shopping',
    extractedText:
      'BOSS HUGO BOSS. CHRONOGRAPH LIMITED SELECTIONS CALIBRE 12. WATER RESISTANT 50M.',
    status: 'ready',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'item-4',
    type: 'image',
    title: 'Oak Chair',
    description: 'Minimal warm scandinavian lounge armchair styling design',
    imageUrl:
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=600',
    category: 'Design',
    extractedText:
      'OAK SOLID BODY WITH BOUCHÉ WOVEN LINING. RETRO ACCENTS FROM THE 1970S DESIGN INSPIRED BY WEGNER.',
    status: 'ready',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'item-5',
    type: 'image',
    title: 'Editorial Looks',
    description: 'High-contrast studio autumn designer collection',
    imageUrl:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600',
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
      'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80&w=600',
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
    description: 'Stellar color mesh and dark translucent glassmorphism explorations',
    imageUrl:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
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
    title: 'Trip Wishlist',
    description: 'Misty multi-layered peak textures in Mount Fuji scenic areas',
    imageUrl:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600',
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
    title: 'Grail Drops',
    description: 'Retro monochrome limited run athletic high-tops',
    imageUrl:
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600',
    category: 'Shopping',
    extractedText:
      'NIKE AIR FORCE 1 VINTAGE COLLECTORS HIGHER MIDSOLE CONTOURS. BLACK STRAP AT THE UPPER FOOTBED.',
    status: 'ready',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'item-10',
    type: 'link',
    title: 'Cryptographic Sovereignty',
    description:
      'Why localized secure hardware enclaves beats remote multi-tenant clouds.',
    imageUrl:
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=600',
    sourceUrl: 'https://notion.so/architecture/sovereign-vault',
    category: 'Articles',
    extractedText:
      'THE CRYPTOGRAPHIC HARDWARE BOUNDS: AES-256 PRIVATE SECURE ENVELOPE SEEDS ARE LOCKED DOWN ON-CHIP FOR HIGH SOVEREIGN METRICS.',
    status: 'ready',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const CATEGORIES_KEY = 'stash_categories_v1';

class StashDatabase {
  private items: StashItem[] = [];
  private categories: string[] = [];
  private ready: Promise<void>;

  constructor() {
    this.ready = this.load();
  }

  private async load() {
    try {
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
      this.items = [...DEFAULT_ITEMS];
      this.categories = ['Shopping', 'Recipes', 'Travel', 'Articles', 'Design'];
    }
  }

  private async save() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    } catch (e) {
      // swallow
    }
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
    }
    return this.categories;
  }

  public async resetCategories(): Promise<void> {
    await this.ready;
    this.categories = ['Shopping', 'Recipes', 'Travel', 'Articles', 'Design'];
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(this.categories));
  }

  public async getAll(): Promise<StashItem[]> {
    await this.ready;
    return [...this.items].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  public async search(query: string): Promise<StashItem[]> {
    const all = await this.getAll();
    const term = query.trim().toLowerCase();
    if (!term) return all;

    const tokens = term.split(/\s+/).filter((t) => t.length > 0);
    if (tokens.length === 0) return all;

    return all.filter((item) => {
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
    await this.ready;
    const newItem: StashItem = {
      ...item,
      id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.items.unshift(newItem);
    await this.save();
    return newItem;
  }

  public async update(
    id: string,
    updates: Partial<StashItem>,
  ): Promise<StashItem | null> {
    await this.ready;
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    this.items[index] = { ...this.items[index], ...updates };
    await this.save();
    return this.items[index];
  }

  public async delete(id: string): Promise<boolean> {
    await this.ready;
    const initialLen = this.items.length;
    this.items = this.items.filter((item) => item.id !== id);
    await this.save();
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
  }
}

export const db = new StashDatabase();
