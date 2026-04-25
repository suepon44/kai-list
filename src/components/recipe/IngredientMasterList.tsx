import React, { useState, useMemo } from 'react';
import type { Recipe } from '../../types';
import { TextInput } from '../common';
import styles from './IngredientMasterList.module.css';

export interface IngredientMasterListProps {
  recipes: Recipe[];
  allIngredients: string[];
  customIngredients: string[];
  onAddCustom: (name: string) => void;
  onDeleteCustom: (name: string) => void;
  onBack: () => void;
}

interface IngredientInfo {
  name: string;
  categories: string[];
  usageCount: number;
  isCustom: boolean;
}

export const IngredientMasterList: React.FC<IngredientMasterListProps> = ({
  recipes,
  allIngredients,
  customIngredients,
  onAddCustom,
  onDeleteCustom,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newIngredientName, setNewIngredientName] = useState('');

  /** 材料ごとの詳細情報を構築 */
  const ingredientInfoMap = useMemo(() => {
    const map = new Map<string, { categories: Set<string>; count: number }>();

    for (const recipe of recipes) {
      // 同一レシピ内の重複材料名をカウントしないようにする
      const seen = new Set<string>();
      for (const ing of recipe.ingredients) {
        const name = ing.name.trim();
        if (!name || seen.has(name)) continue;
        seen.add(name);

        if (!map.has(name)) {
          map.set(name, { categories: new Set(), count: 0 });
        }
        const info = map.get(name)!;
        info.count += 1;
        if (ing.category) {
          info.categories.add(ing.category);
        }
      }
    }

    return map;
  }, [recipes]);

  /** 全材料の詳細リスト */
  const ingredientList: IngredientInfo[] = useMemo(() => {
    return allIngredients.map((name) => {
      const info = ingredientInfoMap.get(name);
      return {
        name,
        categories: info ? [...info.categories].sort((a, b) => a.localeCompare(b, 'ja')) : [],
        usageCount: info?.count ?? 0,
        isCustom: customIngredients.includes(name),
      };
    });
  }, [allIngredients, ingredientInfoMap, customIngredients]);

  /** 検索フィルタ適用後のリスト */
  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ingredientList;
    return ingredientList.filter((item) =>
      item.name.toLowerCase().includes(q),
    );
  }, [ingredientList, searchQuery]);

  const handleAddCustom = () => {
    const trimmed = newIngredientName.trim();
    if (!trimmed) return;
    onAddCustom(trimmed);
    setNewIngredientName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustom();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          ← 戻る
        </button>
        <h2 className={styles.title}>材料一覧</h2>
      </div>

      <div className={styles.addSection} onKeyDown={handleKeyDown}>
        <div className={styles.addInputWrapper}>
          <TextInput
            label="新規材料を追加"
            value={newIngredientName}
            onChange={setNewIngredientName}
            placeholder="材料名を入力"
            id="new-custom-ingredient"
          />
        </div>
        <button
          type="button"
          className={styles.addButton}
          onClick={handleAddCustom}
          disabled={!newIngredientName.trim()}
        >
          追加
        </button>
      </div>

      <div className={styles.searchSection}>
        <TextInput
          label="検索"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="材料名で検索..."
          id="ingredient-search"
        />
      </div>

      <div className={styles.stats}>
        全 {filteredList.length} 件
        {searchQuery.trim() && ` (${ingredientList.length} 件中)`}
      </div>

      {filteredList.length === 0 ? (
        <p className={styles.emptyMessage}>
          {searchQuery.trim()
            ? '該当する材料が見つかりません。'
            : '材料がまだ登録されていません。'}
        </p>
      ) : (
        <div className={styles.list} role="list">
          {filteredList.map((item) => (
            <div key={item.name} className={styles.listItem} role="listitem">
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{item.name}</span>
                <div className={styles.itemMeta}>
                  {item.categories.length > 0 && (
                    <span className={styles.itemCategory}>
                      {item.categories.join(', ')}
                    </span>
                  )}
                  {item.usageCount > 0 && (
                    <span className={styles.itemUsage}>
                      {item.usageCount}レシピ
                    </span>
                  )}
                  {item.isCustom && (
                    <span className={styles.customBadge}>カスタム</span>
                  )}
                </div>
              </div>
              {item.isCustom && (
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => onDeleteCustom(item.name)}
                  aria-label={`${item.name} を削除`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
