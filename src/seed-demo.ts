import { STORAGE_KEYS } from './constants';
import type { Recipe, Ingredient, SavedMealPlan, ExtraItem } from './types';

// --- Helper ---
const ts = '2026-02-28T00:00:00.000Z';

function ing(name: string, category: string | null, quantity?: number, unit?: string): Ingredient {
  return { name, quantity, unit, category };
}

// --- Recipes ---
function buildRecipes(): Recipe[] {
  const recipes: Recipe[] = [
    {
      id: crypto.randomUUID(),
      name: 'カレーライス',
      ingredients: [
        ing('じゃがいも', '野菜', 3, '個'),
        ing('にんじん', '野菜', 1, '本'),
        ing('玉ねぎ', '野菜', 2, '個'),
        ing('豚肉', '肉類', 300, 'g'),
        ing('カレールー', '調味料', 1, '箱'),
        ing('サラダ油', '調味料'),
      ],
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: crypto.randomUUID(),
      name: '明太子パスタ',
      ingredients: [
        ing('パスタ', '乾物', 400, 'g'),
        ing('明太子', '魚介類', 2, '腹'),
        ing('バター', '乳製品', 30, 'g'),
        ing('牛乳', '乳製品', 100, 'ml'),
        ing('大葉', '野菜', 5, '枚'),
        ing('海苔', '乾物'),
      ],
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: crypto.randomUUID(),
      name: '餃子',
      ingredients: [
        ing('豚ひき肉', '肉類', 300, 'g'),
        ing('キャベツ', '野菜', 0.25, '個'),
        ing('ニラ', '野菜', 1, '束'),
        ing('にんにく', '野菜', 2, '片'),
        ing('生姜', '野菜', 1, '片'),
        ing('餃子の皮', '乾物', 30, '枚'),
        ing('ごま油', '調味料'),
      ],
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: crypto.randomUUID(),
      name: 'からあげ',
      ingredients: [
        ing('鶏もも肉', '肉類', 600, 'g'),
        ing('にんにく', '野菜', 2, '片'),
        ing('生姜', '野菜', 1, '片'),
        ing('醤油', '調味料', 3, '大さじ'),
        ing('片栗粉', '調味料'),
        ing('サラダ油', '調味料'),
      ],
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: crypto.randomUUID(),
      name: '焼きうどん',
      ingredients: [
        ing('うどん', '乾物', 4, '玉'),
        ing('豚バラ肉', '肉類', 200, 'g'),
        ing('キャベツ', '野菜', 0.25, '個'),
        ing('にんじん', '野菜', 0.5, '本'),
        ing('もやし', '野菜', 1, '袋'),
        ing('かつお節', '乾物'),
      ],
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: crypto.randomUUID(),
      name: '焼きそば',
      ingredients: [
        ing('焼きそば麺', '乾物', 4, '玉'),
        ing('豚バラ肉', '肉類', 200, 'g'),
        ing('キャベツ', '野菜', 0.25, '個'),
        ing('もやし', '野菜', 1, '袋'),
        ing('紅しょうが', '野菜'),
        ing('青のり', '乾物'),
      ],
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: crypto.randomUUID(),
      name: 'とんかつ',
      ingredients: [
        ing('豚ロース肉', '肉類', 4, '枚'),
        ing('卵', '乳製品', 2, '個'),
        ing('パン粉', '調味料'),
        ing('小麦粉', '調味料'),
        ing('キャベツ', '野菜', 0.25, '個'),
        ing('サラダ油', '調味料'),
      ],
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: crypto.randomUUID(),
      name: 'オムライス',
      ingredients: [
        ing('鶏もも肉', '肉類', 200, 'g'),
        ing('玉ねぎ', '野菜', 1, '個'),
        ing('ご飯', '乾物', 4, '杯分'),
        ing('ケチャップ', '調味料'),
        ing('卵', '乳製品', 6, '個'),
        ing('バター', '乳製品'),
      ],
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: crypto.randomUUID(),
      name: 'ミートソースパスタ',
      ingredients: [
        ing('パスタ', '乾物', 400, 'g'),
        ing('合いびき肉', '肉類', 300, 'g'),
        ing('玉ねぎ', '野菜', 1, '個'),
        ing('にんじん', '野菜', 0.5, '本'),
        ing('トマト缶', '調味料', 1, '缶'),
        ing('にんにく', '野菜', 2, '片'),
      ],
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: crypto.randomUUID(),
      name: 'カルボナーラ',
      ingredients: [
        ing('パスタ', '乾物', 400, 'g'),
        ing('ベーコン', '肉類', 150, 'g'),
        ing('卵', '乳製品', 3, '個'),
        ing('パルメザンチーズ', '乳製品', 80, 'g'),
        ing('黒こしょう', '調味料'),
        ing('にんにく', '野菜', 1, '片'),
      ],
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: crypto.randomUUID(),
      name: '焼き魚（鮭）',
      ingredients: [
        ing('鮭切り身', '魚介類', 4, '切れ'),
        ing('大根', '野菜', 0.25, '本'),
        ing('レモン', '野菜', 1, '個'),
      ],
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: crypto.randomUUID(),
      name: '肉じゃが',
      ingredients: [
        ing('豚肉', '肉類', 300, 'g'),
        ing('じゃがいも', '野菜', 4, '個'),
        ing('にんじん', '野菜', 1, '本'),
        ing('玉ねぎ', '野菜', 2, '個'),
        ing('しらたき', '乾物', 1, '袋'),
        ing('いんげん', '野菜'),
      ],
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: crypto.randomUUID(),
      name: '味噌汁',
      ingredients: [
        ing('豆腐', '乳製品', 1, '丁'),
        ing('わかめ', '乾物', 10, 'g'),
        ing('長ねぎ', '野菜', 1, '本'),
        ing('味噌', '調味料'),
      ],
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: crypto.randomUUID(),
      name: 'ハンバーグ',
      ingredients: [
        ing('合いびき肉', '肉類', 400, 'g'),
        ing('玉ねぎ', '野菜', 1, '個'),
        ing('パン粉', '調味料'),
        ing('卵', '乳製品', 1, '個'),
        ing('牛乳', '乳製品'),
        ing('ナツメグ', '調味料'),
      ],
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: crypto.randomUUID(),
      name: '麻婆豆腐',
      ingredients: [
        ing('豆腐', '乳製品', 2, '丁'),
        ing('豚ひき肉', '肉類', 200, 'g'),
        ing('長ねぎ', '野菜', 1, '本'),
        ing('にんにく', '野菜', 2, '片'),
        ing('生姜', '野菜', 1, '片'),
        ing('豆板醤', '調味料'),
      ],
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: crypto.randomUUID(),
      name: 'チキン南蛮',
      ingredients: [
        ing('鶏もも肉', '肉類', 600, 'g'),
        ing('卵', '乳製品', 3, '個'),
        ing('小麦粉', '調味料'),
        ing('玉ねぎ', '野菜', 0.5, '個'),
        ing('マヨネーズ', '調味料'),
        ing('酢', '調味料'),
      ],
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: crypto.randomUUID(),
      name: '豚の生姜焼き',
      ingredients: [
        ing('豚ロース肉', '肉類', 400, 'g'),
        ing('玉ねぎ', '野菜', 1, '個'),
        ing('生姜', '野菜', 2, '片'),
        ing('キャベツ', '野菜', 0.25, '個'),
      ],
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: crypto.randomUUID(),
      name: '親子丼',
      ingredients: [
        ing('鶏もも肉', '肉類', 300, 'g'),
        ing('玉ねぎ', '野菜', 2, '個'),
        ing('卵', '乳製品', 6, '個'),
        ing('ご飯', '乾物', 4, '杯分'),
        ing('三つ葉', '野菜'),
      ],
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: crypto.randomUUID(),
      name: '回鍋肉',
      ingredients: [
        ing('豚バラ肉', '肉類', 300, 'g'),
        ing('キャベツ', '野菜', 0.5, '個'),
        ing('ピーマン', '野菜', 4, '個'),
        ing('にんにく', '野菜', 2, '片'),
        ing('豆板醤', '調味料'),
      ],
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: crypto.randomUUID(),
      name: 'サバの味噌煮',
      ingredients: [
        ing('サバ切り身', '魚介類', 4, '切れ'),
        ing('生姜', '野菜', 2, '片'),
        ing('長ねぎ', '野菜', 1, '本'),
        ing('味噌', '調味料'),
      ],
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: crypto.randomUUID(),
      name: '野菜炒め',
      ingredients: [
        ing('豚バラ肉', '肉類', 200, 'g'),
        ing('キャベツ', '野菜', 0.25, '個'),
        ing('にんじん', '野菜', 0.5, '本'),
        ing('もやし', '野菜', 1, '袋'),
        ing('ピーマン', '野菜', 2, '個'),
      ],
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: crypto.randomUUID(),
      name: '鶏の照り焼き',
      ingredients: [
        ing('鶏もも肉', '肉類', 4, '枚'),
        ing('長ねぎ', '野菜', 1, '本'),
      ],
      createdAt: ts,
      updatedAt: ts,
    },
  ];
  return recipes;
}

// --- Extra Items (調味料・日用品) ---
const EXTRA_ITEMS: ExtraItem[] = [
  { name: '醤油', category: '調味料' },
  { name: 'みりん', category: '調味料' },
  { name: '料理酒', category: '調味料' },
  { name: '砂糖', category: '調味料' },
  { name: '塩', category: '調味料' },
  { name: 'サラダ油', category: '調味料' },
  { name: 'アルミホイル', category: '日用品' },
  { name: 'ラップ', category: '日用品' },
  { name: 'キッチンペーパー', category: '日用品' },
  { name: 'トイレットペーパー', category: '日用品' },
  { name: 'ティッシュ', category: '日用品' },
  { name: 'ゴミ袋', category: '日用品' },
];

// --- Meal Plans ---
interface MealPlanDef {
  name: string;
  weekStartDate: string;
  createdAt: string;
  meals: {
    monday: string[];
    tuesday: string[];
    wednesday: string[];
    thursday: string[];
    friday: string[];
  };
}

const MEAL_PLAN_DEFS: MealPlanDef[] = [
  {
    name: '3月第1週 (3/2-3/6)',
    weekStartDate: '2026-03-02',
    createdAt: '2026-03-02T00:00:00.000Z',
    meals: {
      monday: ['カレーライス', '味噌汁'],
      tuesday: ['焼き魚（鮭）', '肉じゃが'],
      wednesday: ['餃子', '野菜炒め'],
      thursday: ['からあげ', '味噌汁'],
      friday: ['焼きうどん'],
    },
  },
  {
    name: '3月第2週 (3/9-3/13)',
    weekStartDate: '2026-03-09',
    createdAt: '2026-03-09T00:00:00.000Z',
    meals: {
      monday: ['ハンバーグ', '味噌汁'],
      tuesday: ['明太子パスタ'],
      wednesday: ['麻婆豆腐', '味噌汁'],
      thursday: ['とんかつ', '味噌汁'],
      friday: ['焼きそば'],
    },
  },
  {
    name: '3月第3週 (3/16-3/20)',
    weekStartDate: '2026-03-16',
    createdAt: '2026-03-16T00:00:00.000Z',
    meals: {
      monday: ['オムライス'],
      tuesday: ['豚の生姜焼き', '味噌汁'],
      wednesday: ['ミートソースパスタ'],
      thursday: ['チキン南蛮', '味噌汁'],
      friday: ['親子丼'],
    },
  },
  {
    name: '3月第4週 (3/23-3/27)',
    weekStartDate: '2026-03-23',
    createdAt: '2026-03-23T00:00:00.000Z',
    meals: {
      monday: ['カルボナーラ'],
      tuesday: ['回鍋肉', '味噌汁'],
      wednesday: ['鶏の照り焼き', '味噌汁'],
      thursday: ['サバの味噌煮', '肉じゃが'],
      friday: ['カレーライス', '味噌汁'],
    },
  },
];

function buildMealPlans(recipes: Recipe[]): SavedMealPlan[] {
  const recipeByName = new Map(recipes.map((r) => [r.name, r.id]));

  function resolveIds(names: string[]): string[] {
    return names.map((n) => {
      const id = recipeByName.get(n);
      if (!id) throw new Error(`Recipe not found: ${n}`);
      return id;
    });
  }

  return MEAL_PLAN_DEFS.map((def) => ({
    id: crypto.randomUUID(),
    name: def.name,
    weekStartDate: def.weekStartDate,
    plan: {
      monday: resolveIds(def.meals.monday),
      tuesday: resolveIds(def.meals.tuesday),
      wednesday: resolveIds(def.meals.wednesday),
      thursday: resolveIds(def.meals.thursday),
      friday: resolveIds(def.meals.friday),
    },
    extraItems: [...EXTRA_ITEMS],
    createdAt: def.createdAt,
  }));
}

// --- Main seed function ---
export function seedDemoData(): void {
  // Only seed if no data exists
  if (localStorage.getItem(STORAGE_KEYS.RECIPES)) return;

  const recipes = buildRecipes();
  const mealPlans = buildMealPlans(recipes);

  localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
  localStorage.setItem(STORAGE_KEYS.MEAL_PLANS, JSON.stringify(mealPlans));
  localStorage.setItem(STORAGE_KEYS.EXTRA_ITEMS_HISTORY, JSON.stringify(EXTRA_ITEMS));

  console.log(
    `[seed-demo] Seeded ${recipes.length} recipes, ${mealPlans.length} meal plans, ${EXTRA_ITEMS.length} extra items`,
  );
}
