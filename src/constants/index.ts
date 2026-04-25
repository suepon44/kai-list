/** デフォルト商品カテゴリ */
export const DEFAULT_CATEGORIES = [
  '野菜',
  '果物',
  '肉類',
  '魚介類',
  '乳製品',
  '調味料',
  '乾物',
  '冷凍食品',
  '飲料',
  '日用品',
] as const;

/** localStorage キー定数 */
export const STORAGE_KEYS = {
  RECIPES: 'sgl:recipes',
  MEAL_PLANS: 'sgl:meal-plans',
  SHOPPING_LISTS: 'sgl:shopping-lists',
  STORE_LAYOUTS: 'sgl:store-layouts',
  CATEGORIES: 'sgl:categories',
  CHECKLIST_STATE: 'sgl:checklist-state',
  EXTRA_ITEMS_HISTORY: 'sgl:extra-items-history',
} as const;
