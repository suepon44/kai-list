/** レシピの参照元 */
export interface RecipeSource {
  type: 'book' | 'url';
  bookName?: string;               // 献立本名
  page?: number;                   // ページ番号
  url?: string;                    // サイトURL
}

/** 材料 */
export interface Ingredient {
  name: string;                    // 材料名
  quantity?: number;               // 分量（任意）
  unit?: string;                   // 単位（g, ml, 個, 本, etc.）（任意）
  category: string | null;         // 商品カテゴリ（null = 未分類）
}

/** レシピ */
export interface Recipe {
  id: string;
  name: string;                    // 料理名
  ingredients: Ingredient[];       // 材料リスト（4人分）
  source?: RecipeSource;           // 参照元（任意）
  createdAt: string;               // 作成日時 (ISO 8601)
  updatedAt: string;               // 更新日時 (ISO 8601)
}

/** 曜日 */
export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

/** 週間献立 */
export type WeeklyMealPlan = {
  [key in Weekday]: string[];      // 各曜日に割り当てられたレシピIDの配列
};

/** 保存済み週間献立 */
export interface SavedMealPlan {
  id: string;
  name: string;                    // 献立名
  plan: WeeklyMealPlan;
  weekStartDate?: string;          // 週の開始日 (ISO 8601 日付文字列、任意)
  createdAt: string;               // 作成日時 (ISO 8601)
}

/** 使用元情報付き材料 */
export interface IngredientWithSource {
  ingredient: Ingredient;
  day: Weekday;
  recipeName: string;
}

/** 集約済み材料 */
export interface AggregatedIngredient {
  name: string;                    // 材料名
  totalQuantity?: number;          // 合計分量（任意）
  unit?: string;                   // 単位（任意）
  category: string | null;         // 商品カテゴリ
  sources: {                       // 使用元の内訳
    day: Weekday;
    recipeName: string;
    quantity?: number;
  }[];
}

/** 買い物リスト */
export interface ShoppingList {
  id: string;
  mealPlanId: string;              // 元の週間献立ID
  items: AggregatedIngredient[];   // 集約済み材料リスト
  createdAt: string;
}

/** セクション */
export interface Section {
  id: string;
  name: string;                    // セクション名（例：野菜コーナー）
  categories: string[];            // このセクションに属する商品カテゴリ
  order: number;                   // セクション内の順序
}

/** 通路 */
export interface Aisle {
  id: string;
  name: string;                    // 通路名
  order: number;                   // 巡回順序（0始まり）
  sections: Section[];             // セクションリスト
}

/** 店舗レイアウト */
export interface StoreLayout {
  id: string;
  storeName: string;               // 店舗名
  aisles: Aisle[];                 // 通路リスト（巡回順）
}

/** カテゴリマッピング（材料カテゴリ → 店舗内位置） */
export interface CategoryMapping {
  [category: string]: {
    aisleId: string;
    sectionId: string;
  };
}

/** 店舗内位置 */
export interface StoreLocation {
  aisleId: string;
  aisleName: string;
  aisleOrder: number;
  sectionId: string;
  sectionName: string;
  sectionOrder: number;
}

/** 並べ替えグループ */
export interface SortedGroup {
  aisleName: string;
  sectionName: string;
  aisleOrder: number;
  sectionOrder: number;
  items: AggregatedIngredient[];
}

/** 並べ替え済み買い物リスト */
export interface SortedShoppingList {
  storeLayoutId: string;
  groups: SortedGroup[];           // 通路・セクション別グループ
  uncategorized: AggregatedIngredient[];  // 未分類材料
}

/** 買い物チェックリスト状態 */
export interface ChecklistState {
  shoppingListId: string;
  checkedItems: Set<string>;       // チェック済み材料名のセット
}

/** バリデーション結果 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
