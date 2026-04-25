# 実装計画: スマート買い物リスト

## 概要

本計画は、スマート買い物リストPWAの実装を段階的に進めるためのタスクリストである。プロジェクトのセットアップから始め、ドメインロジック（純粋関数）→ リポジトリ層 → Hooks層 → UIコンポーネント → PWA対応の順に実装し、各段階でテストを行う。ドメインロジックをUIから分離し、テスト容易性を最大化する設計方針に従う。

## タスク

- [x] 1. プロジェクトセットアップと型定義
  - [x] 1.1 Vite + React + TypeScriptプロジェクトを初期化する
    - `npm create vite@latest` でReact + TypeScriptテンプレートを使用してプロジェクトを作成
    - Vitest、fast-check、React Testing Library を devDependencies に追加
    - `vitest.config.ts` を作成し、テスト環境を設定（jsdom環境）
    - `tsconfig.json` の strict モードを有効化
    - _要件: 10.1_

  - [x] 1.2 型定義ファイルを作成する
    - `src/types/index.ts` に全エンティティの型定義を作成
    - `Recipe`, `Ingredient`, `RecipeSource`, `Weekday`, `WeeklyMealPlan`, `SavedMealPlan` を定義
    - `IngredientWithSource`, `AggregatedIngredient`, `ShoppingList` を定義
    - `StoreLayout`, `Aisle`, `Section`, `CategoryMapping`, `StoreLocation` を定義
    - `SortedShoppingList`, `SortedGroup`, `ChecklistState`, `ValidationResult` を定義
    - `src/constants/index.ts` に `DEFAULT_CATEGORIES` とlocalStorageキー定数を定義
    - _要件: 1.1, 5.3, 6.1, 7.2_

- [x] 2. リポジトリ層の実装
  - [x] 2.1 汎用LocalStorageRepositoryクラスを実装する
    - `src/repositories/local-storage.ts` に `LocalStorageRepository<T>` クラスを作成
    - `getAll()`, `getById()`, `save()`, `update()`, `delete()` メソッドを実装
    - JSONシリアライズ/デシリアライズを内部で処理
    - `StorageError` カスタムエラークラスを作成
    - localStorage容量超過、JSONパースエラー、アクセス不可のエラーハンドリングを実装
    - _要件: 10.1, 10.2, 10.3_

  - [ ]* 2.2 LocalStorageRepositoryのユニットテストを作成する
    - `src/repositories/__tests__/local-storage.test.ts` を作成
    - CRUD操作の正常系テスト（保存→取得→更新→削除）
    - localStorage容量超過時のエラーハンドリングテスト
    - JSONパースエラー時のエラーハンドリングテスト
    - 空のストレージからの取得テスト
    - _要件: 10.1, 10.2, 10.3_

- [x] 3. レシピドメインロジックの実装
  - [x] 3.1 レシピバリデーション関数を実装する
    - `src/domain/recipe.ts` に `validateRecipe()` 関数を作成
    - 料理名が空文字・空白のみの場合にバリデーションエラーを返す
    - 材料リストが空の場合にバリデーションエラーを返す
    - 有効なレシピの場合は `{ valid: true, errors: [] }` を返す
    - _要件: 1.3, 1.4_

  - [ ]* 3.2 レシピバリデーションのプロパティテストを作成する
    - `src/domain/__tests__/properties/recipe.prop.test.ts` を作成
    - **Property 2: 空白料理名の拒否**
    - **検証対象: 要件 1.3**

  - [ ]* 3.3 レシピバリデーションのユニットテストを作成する
    - `src/domain/__tests__/recipe.test.ts` を作成
    - 有効なレシピのバリデーション成功テスト
    - 空の料理名、空白のみの料理名のバリデーション失敗テスト
    - 空の材料リストのバリデーション失敗テスト
    - _要件: 1.3, 1.4_

- [x] 4. チェックポイント — テスト実行確認
  - すべてのテストが通ることを確認し、不明点があればユーザーに質問する。

- [x] 5. 献立ドメインロジックの実装
  - [x] 5.1 献立操作関数を実装する
    - `src/domain/meal-plan.ts` に `isMealPlanEmpty()` 関数を作成
    - `extractAllIngredients()` 関数を作成（週間献立から全材料を曜日・レシピ名付きで抽出）
    - _要件: 3.1, 5.1, 5.5_

  - [ ]* 5.2 献立操作のユニットテストを作成する
    - `src/domain/__tests__/meal-plan.test.ts` を作成
    - 空の献立の判定テスト
    - 複数曜日・複数レシピからの材料抽出テスト
    - 1日に複数レシピが割り当てられた場合のテスト
    - _要件: 3.3, 5.1_

- [x] 6. 買い物リスト生成エンジンの実装
  - [x] 6.1 材料合算ロジックと買い物リスト生成関数を実装する
    - `src/domain/shopping-list.ts` に `aggregateIngredients()` 関数を作成
    - 同一材料名かつ同一単位の材料を1つにまとめ、分量を合計する
    - 各集約済み材料に使用元の内訳（曜日・レシピ名・分量）を保持する
    - `generateShoppingList()` 関数を作成（WeeklyMealPlan → ShoppingList）
    - _要件: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 6.2 材料合算のプロパティテストを作成する
    - `src/domain/__tests__/properties/shopping-list.prop.test.ts` を作成
    - **Property 4: 材料合算の正確性**
    - **検証対象: 要件 5.1, 5.2, 5.3, 5.4**

  - [ ]* 6.3 買い物リスト生成のユニットテストを作成する
    - `src/domain/__tests__/shopping-list.test.ts` を作成
    - 「にんじん 2本 + にんじん 3本 = にんじん 5本」のような具体的な合算テスト
    - 同一材料名で異なる単位の場合は別項目になるテスト
    - 空の献立からの生成拒否テスト
    - 使用元内訳の正確性テスト
    - _要件: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7. 並べ替えエンジンの実装
  - [x] 7.1 ピッキング順序並べ替え関数を実装する
    - `src/domain/sorting.ts` に `resolveLocation()` 関数を作成
    - `sortByStoreLayout()` 関数を作成
    - 通路順序 → セクション順序の優先度で並べ替え
    - 未分類の材料はuncategorizedフィールドに格納
    - 各グループにaisleName・sectionNameを付与
    - _要件: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 7.2 並べ替えエンジンのプロパティテストを作成する
    - `src/domain/__tests__/properties/sorting.prop.test.ts` を作成
    - **Property 6: ピッキング順序の正確性**
    - **検証対象: 要件 8.1, 8.2, 8.3**
    - **Property 7: 未分類材料の末尾配置**
    - **検証対象: 要件 7.4, 8.4**
    - **Property 8: 並べ替え不変条件**
    - **検証対象: 要件 8.5**

  - [ ]* 7.3 並べ替えエンジンのユニットテストを作成する
    - `src/domain/__tests__/sorting.test.ts` を作成
    - 2通路・3セクションの具体的な並べ替えテスト
    - 全材料が未分類の場合のテスト
    - カテゴリマッピングが部分的な場合のテスト
    - _要件: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 8. チェックポイント — ドメインロジックのテスト確認
  - すべてのテストが通ることを確認し、不明点があればユーザーに質問する。

- [x] 9. リポジトリ層のラウンドトリップテスト
  - [ ]* 9.1 レシピ保存ラウンドトリップのプロパティテストを作成する
    - `src/domain/__tests__/properties/recipe.prop.test.ts` に追加
    - **Property 1: レシピ保存ラウンドトリップ**
    - **検証対象: 要件 1.1, 1.5, 2.1, 7.1**

  - [ ]* 9.2 献立保存ラウンドトリップのプロパティテストを作成する
    - `src/domain/__tests__/properties/meal-plan.prop.test.ts` を作成
    - **Property 3: 献立保存ラウンドトリップ**
    - **検証対象: 要件 3.3, 4.1, 4.3**

  - [ ]* 9.3 店舗レイアウト保存ラウンドトリップのプロパティテストを作成する
    - `src/domain/__tests__/properties/store-layout.prop.test.ts` を作成
    - **Property 5: 店舗レイアウト保存ラウンドトリップ**
    - **検証対象: 要件 6.1, 6.2, 6.3**

- [x] 10. Hooks層の実装
  - [x] 10.1 useRecipes フックを実装する
    - `src/hooks/useRecipes.ts` を作成
    - レシピのCRUD操作（追加・更新・削除）をリポジトリ経由で実装
    - `validateRecipe()` を呼び出してバリデーションを実行
    - React状態とlocalStorageの同期を管理
    - _要件: 1.1, 1.3, 1.4, 1.5, 2.1_

  - [x] 10.2 useMealPlan フックを実装する
    - `src/hooks/useMealPlan.ts` を作成
    - 週間献立の作成・レシピ割り当て・削除を実装
    - 献立の保存（名前付き）・読み込み・削除を実装
    - 保存済み献立一覧の取得を実装
    - _要件: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 10.3 useShoppingList フックを実装する
    - `src/hooks/useShoppingList.ts` を作成
    - `generateShoppingList()` を呼び出して買い物リスト生成
    - `sortByStoreLayout()` を呼び出して並べ替え
    - チェック状態の管理（トグル、カウント）を実装
    - 購入済み材料を未購入の下に移動する表示順序ロジックを実装
    - _要件: 5.1, 8.1, 9.1, 9.2, 9.3, 9.4_

  - [x] 10.4 useStoreLayout フックを実装する
    - `src/hooks/useStoreLayout.ts` を作成
    - 店舗レイアウトのCRUD操作を実装
    - 通路・セクションの追加・削除・並べ替えを実装
    - カスタム商品カテゴリの管理を実装
    - _要件: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.2, 7.3_

- [x] 11. チェックポイント — Hooks層の確認
  - すべてのテストが通ることを確認し、不明点があればユーザーに質問する。

- [x] 12. チェックリストのプロパティテスト
  - [ ]* 12.1 チェック機能のプロパティテストを作成する
    - `src/domain/__tests__/properties/checklist.prop.test.ts` を作成
    - **Property 9: チェックトグルのラウンドトリップ**
    - **検証対象: 要件 9.1, 9.2**
    - **Property 10: チェックカウント不変条件**
    - **検証対象: 要件 9.3**
    - **Property 11: 購入済み材料の表示順序**
    - **検証対象: 要件 9.4**

- [x] 13. 共通UIコンポーネントの実装
  - [x] 13.1 共通コンポーネントを作成する
    - `src/components/common/` にレイアウトコンポーネント（Header, Navigation, Page）を作成
    - エラー表示コンポーネント（ErrorMessage, ErrorBoundary）を作成
    - 確認ダイアログコンポーネント（ConfirmDialog）を作成
    - フォーム共通コンポーネント（TextInput, NumberInput, Select）を作成
    - モバイルファーストのレスポンシブスタイルを適用
    - _要件: 1.3, 1.4, 3.5, 4.5, 10.3_

- [x] 14. レシピ管理UIの実装
  - [x] 14.1 レシピ一覧・登録・編集コンポーネントを作成する
    - `src/components/recipe/RecipeList.tsx` — レシピ一覧表示
    - `src/components/recipe/RecipeForm.tsx` — レシピ登録・編集フォーム
    - `src/components/recipe/RecipeDetail.tsx` — レシピ詳細表示（参照元情報含む）
    - `src/components/recipe/IngredientInput.tsx` — 材料入力コンポーネント（カテゴリ選択付き）
    - 料理名、材料リスト（材料名・分量・単位・カテゴリ）、参照元情報の入力フォーム
    - バリデーションエラーのインライン表示
    - _要件: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 7.1, 7.2_

- [x] 15. 献立管理UIの実装
  - [x] 15.1 週間献立作成・管理コンポーネントを作成する
    - `src/components/meal-plan/WeeklyPlanView.tsx` — 月〜金の献立枠表示
    - `src/components/meal-plan/DaySlot.tsx` — 曜日ごとのレシピ割り当て
    - `src/components/meal-plan/RecipeSelector.tsx` — レシピ選択ダイアログ
    - `src/components/meal-plan/SavedPlanList.tsx` — 保存済み献立一覧
    - 各曜日に複数レシピを割り当て可能なUI
    - 各曜日の料理名と材料一覧の表示
    - 保存時の献立名入力、上書き/新規保存の選択
    - 空の献立保存時の確認メッセージ
    - _要件: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 16. 買い物リストUIの実装
  - [x] 16.1 買い物リスト表示・チェック機能コンポーネントを作成する
    - `src/components/shopping-list/ShoppingListView.tsx` — 買い物リスト全体表示
    - `src/components/shopping-list/ShoppingItem.tsx` — 個別材料表示（チェック機能付き）
    - `src/components/shopping-list/IngredientDetail.tsx` — 材料の使用元内訳表示
    - `src/components/shopping-list/ProgressBar.tsx` — 購入進捗表示（未購入/購入済みカウント）
    - 通路・セクション別グループ表示
    - 未分類材料の末尾表示
    - タップでチェックトグル、購入済みは下に移動
    - 店舗レイアウト選択による並べ替え
    - _要件: 5.1, 5.3, 5.4, 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.3, 9.4_

- [x] 17. 店舗レイアウト管理UIの実装
  - [x] 17.1 店舗レイアウト設定コンポーネントを作成する
    - `src/components/store-layout/StoreLayoutList.tsx` — 店舗レイアウト一覧
    - `src/components/store-layout/StoreLayoutEditor.tsx` — 店舗レイアウト編集
    - `src/components/store-layout/AisleEditor.tsx` — 通路の追加・削除・並べ替え
    - `src/components/store-layout/SectionEditor.tsx` — セクションの追加・削除・カテゴリ割り当て
    - 通路の巡回順序設定（ドラッグまたは上下ボタン）
    - 通路なしでの保存時のエラー表示
    - _要件: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.3_

- [x] 18. アプリ全体の統合
  - [x] 18.1 ルーティングとページ統合を実装する
    - `src/App.tsx` にページナビゲーション（タブまたはボトムナビゲーション）を実装
    - レシピ管理、献立作成、買い物リスト、店舗設定の各ページを統合
    - React Error Boundary でアプリ全体のエラーハンドリングを設定
    - アプリ起動時にlocalStorageからデータを復元
    - _要件: 10.1, 10.2, 10.3_

- [x] 19. チェックポイント — UI統合の確認
  - すべてのテストが通ることを確認し、不明点があればユーザーに質問する。

- [x] 20. PWA対応
  - [x] 20.1 Service WorkerとPWAマニフェストを設定する
    - `vite-plugin-pwa` を導入し、Workbox設定を追加
    - `manifest.json` を作成（アプリ名、アイコン、テーマカラー）
    - プリキャッシュ戦略を設定（アプリシェル + 静的アセット）
    - オフライン時のフォールバック動作を確認
    - _要件: 10.1, 10.2_

- [x] 21. 最終チェックポイント — 全テスト実行と最終確認
  - すべてのテストが通ることを確認し、不明点があればユーザーに質問する。

## 備考

- `*` マーク付きのタスクはオプションであり、MVP実装時にはスキップ可能
- 各タスクは具体的な要件番号を参照しており、トレーサビリティを確保
- チェックポイントで段階的に品質を検証
- プロパティテストは設計書の正確性プロパティに基づき、普遍的な正確性を検証
- ユニットテストは具体的な例とエッジケースを検証
