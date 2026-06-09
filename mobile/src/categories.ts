import { CategoryKey } from './types';

export const CATEGORY_DICTIONARY: Record<CategoryKey, string[]> = {
  Shopping: [
    'buy', 'price', 'shop', 'sneaker', 'shoe', 'dress', 'shirt', 'pants',
    'watch', 'jacket', 'amazon', 'etsy', 'store', 'cart', 'sale',
    'boss', 'gold', 'liner', 'set',
  ],
  Recipes: [
    'cook', 'ingredient', 'food', 'brunch', 'lunch', 'dinner', 'recipe',
    'bake', 'salad', 'kitchen', 'taste', 'eat', 'bonappetit', 'restaurant',
  ],
  Travel: [
    'trip', 'flight', 'travel', 'hotel', 'mountain', 'vacation', 'beach',
    'tokyo', 'paris', 'map', 'explore', 'booking', 'airbnb', 'scenery', 'island',
  ],
  Articles: [
    'read', 'blog', 'news', 'medium', 'notion', 'post', 'writing', 'book',
    'theory', 'essay', 'newsletter', 'article', 'nyt',
  ],
  Design: [
    'designer', 'inspiration', 'gradient', 'minimal', 'ui', 'ux', 'art',
    'portfolio', 'poster', 'dribbble', 'figma', 'render', '3d', 'creative',
    'aesthetic', 'interior', 'chair', 'furniture',
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
