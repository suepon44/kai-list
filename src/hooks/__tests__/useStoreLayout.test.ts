import { renderHook, act } from '@testing-library/react';
import { useStoreLayout, validateStoreLayout } from '../useStoreLayout';
import type { StoreLayout } from '../../types';

// localStorage をテストごとにクリアする
beforeEach(() => {
  localStorage.clear();
});

describe('useStoreLayout', () => {
  describe('初期状態', () => {
    it('localStorageが空の場合、空配列を返す', () => {
      const { result } = renderHook(() => useStoreLayout());
      expect(result.current.storeLayouts).toEqual([]);
      expect(result.current.customCategories).toEqual([]);
    });

    it('localStorageに既存データがある場合、それを読み込む', () => {
      const existing: StoreLayout[] = [
        {
          id: 'store-1',
          storeName: 'テストスーパー',
          aisles: [
            {
              id: 'aisle-1',
              name: '通路1',
              order: 0,
              sections: [],
            },
          ],
        },
      ];
      localStorage.setItem('sgl:store-layouts', JSON.stringify(existing));

      const { result } = renderHook(() => useStoreLayout());
      expect(result.current.storeLayouts).toHaveLength(1);
      expect(result.current.storeLayouts[0].storeName).toBe('テストスーパー');
    });

    it('localStorageにカスタムカテゴリがある場合、それを読み込む', () => {
      localStorage.setItem(
        'sgl:categories',
        JSON.stringify(['お菓子', 'ベビー用品']),
      );

      const { result } = renderHook(() => useStoreLayout());
      expect(result.current.customCategories).toEqual(['お菓子', 'ベビー用品']);
    });
  });

  describe('addStoreLayout', () => {
    it('新しい店舗レイアウトを追加できる', () => {
      const { result } = renderHook(() => useStoreLayout());

      let newLayout: StoreLayout;
      act(() => {
        newLayout = result.current.addStoreLayout('近所のスーパー');
      });

      expect(result.current.storeLayouts).toHaveLength(1);
      expect(result.current.storeLayouts[0].storeName).toBe('近所のスーパー');
      expect(result.current.storeLayouts[0].aisles).toEqual([]);
      expect(newLayout!.id).toBeDefined();
      expect(newLayout!.storeName).toBe('近所のスーパー');
    });

    it('localStorageにデータが永続化される', () => {
      const { result } = renderHook(() => useStoreLayout());

      act(() => {
        result.current.addStoreLayout('テストストア');
      });

      const stored = JSON.parse(
        localStorage.getItem('sgl:store-layouts') || '[]',
      );
      expect(stored).toHaveLength(1);
      expect(stored[0].storeName).toBe('テストストア');
    });

    it('複数の店舗レイアウトを保存できる（要件 6.5）', () => {
      const { result } = renderHook(() => useStoreLayout());

      act(() => {
        result.current.addStoreLayout('スーパーA');
      });
      act(() => {
        result.current.addStoreLayout('スーパーB');
      });

      expect(result.current.storeLayouts).toHaveLength(2);
    });
  });

  describe('updateStoreLayout', () => {
    it('既存の店舗レイアウトを更新できる', () => {
      const { result } = renderHook(() => useStoreLayout());

      let layout: StoreLayout;
      act(() => {
        layout = result.current.addStoreLayout('元の名前');
      });

      const updated: StoreLayout = {
        ...layout!,
        storeName: '更新後の名前',
        aisles: [
          {
            id: 'aisle-1',
            name: '青果コーナー',
            order: 0,
            sections: [
              {
                id: 'section-1',
                name: '野菜',
                categories: ['野菜'],
                order: 0,
              },
            ],
          },
        ],
      };

      act(() => {
        result.current.updateStoreLayout(layout!.id, updated);
      });

      expect(result.current.storeLayouts).toHaveLength(1);
      expect(result.current.storeLayouts[0].storeName).toBe('更新後の名前');
      expect(result.current.storeLayouts[0].aisles).toHaveLength(1);
    });

    it('更新がlocalStorageに反映される', () => {
      const { result } = renderHook(() => useStoreLayout());

      let layout: StoreLayout;
      act(() => {
        layout = result.current.addStoreLayout('テスト');
      });

      act(() => {
        result.current.updateStoreLayout(layout!.id, {
          ...layout!,
          storeName: '更新済み',
        });
      });

      const stored = JSON.parse(
        localStorage.getItem('sgl:store-layouts') || '[]',
      );
      expect(stored[0].storeName).toBe('更新済み');
    });
  });

  describe('deleteStoreLayout', () => {
    it('店舗レイアウトを削除できる', () => {
      const { result } = renderHook(() => useStoreLayout());

      let layout: StoreLayout;
      act(() => {
        layout = result.current.addStoreLayout('削除対象');
      });

      act(() => {
        result.current.deleteStoreLayout(layout!.id);
      });

      expect(result.current.storeLayouts).toHaveLength(0);
    });

    it('削除がlocalStorageに反映される', () => {
      const { result } = renderHook(() => useStoreLayout());

      let layout: StoreLayout;
      act(() => {
        layout = result.current.addStoreLayout('削除対象');
      });

      act(() => {
        result.current.deleteStoreLayout(layout!.id);
      });

      const stored = JSON.parse(
        localStorage.getItem('sgl:store-layouts') || '[]',
      );
      expect(stored).toHaveLength(0);
    });

    it('複数レイアウトから特定のレイアウトのみ削除できる', () => {
      const { result } = renderHook(() => useStoreLayout());

      let layoutA: StoreLayout;
      act(() => {
        layoutA = result.current.addStoreLayout('スーパーA');
      });
      act(() => {
        result.current.addStoreLayout('スーパーB');
      });

      act(() => {
        result.current.deleteStoreLayout(layoutA!.id);
      });

      expect(result.current.storeLayouts).toHaveLength(1);
      expect(result.current.storeLayouts[0].storeName).toBe('スーパーB');
    });
  });

  describe('getStoreLayout', () => {
    it('IDで店舗レイアウトを取得できる', () => {
      const { result } = renderHook(() => useStoreLayout());

      let layout: StoreLayout;
      act(() => {
        layout = result.current.addStoreLayout('テストストア');
      });

      const found = result.current.getStoreLayout(layout!.id);
      expect(found).not.toBeNull();
      expect(found!.storeName).toBe('テストストア');
    });

    it('存在しないIDの場合、nullを返す', () => {
      const { result } = renderHook(() => useStoreLayout());

      const found = result.current.getStoreLayout('non-existent');
      expect(found).toBeNull();
    });
  });

  describe('validateStoreLayout', () => {
    it('通路が1つ以上ある場合、バリデーション成功（要件 6.6）', () => {
      const { result } = renderHook(() => useStoreLayout());
      const layout: StoreLayout = {
        id: 'test',
        storeName: 'テスト',
        aisles: [
          { id: 'a1', name: '通路1', order: 0, sections: [] },
        ],
      };

      const validationResult = result.current.validateStoreLayout(layout);
      expect(validationResult).toEqual({ valid: true, errors: [] });
    });

    it('通路が0の場合、バリデーション失敗（要件 6.6）', () => {
      const { result } = renderHook(() => useStoreLayout());
      const layout: StoreLayout = {
        id: 'test',
        storeName: 'テスト',
        aisles: [],
      };

      const validationResult = result.current.validateStoreLayout(layout);
      expect(validationResult).toEqual({
        valid: false,
        errors: ['通路を1つ以上登録してください'],
      });
    });
  });

  describe('カスタムカテゴリ管理', () => {
    it('カスタムカテゴリを追加できる（要件 7.3）', () => {
      const { result } = renderHook(() => useStoreLayout());

      act(() => {
        result.current.addCustomCategory('お菓子');
      });

      expect(result.current.customCategories).toEqual(['お菓子']);
    });

    it('カスタムカテゴリがlocalStorageに永続化される', () => {
      const { result } = renderHook(() => useStoreLayout());

      act(() => {
        result.current.addCustomCategory('ベビー用品');
      });

      const stored = JSON.parse(
        localStorage.getItem('sgl:categories') || '[]',
      );
      expect(stored).toEqual(['ベビー用品']);
    });

    it('重複するカスタムカテゴリは追加されない', () => {
      const { result } = renderHook(() => useStoreLayout());

      act(() => {
        result.current.addCustomCategory('お菓子');
      });
      act(() => {
        result.current.addCustomCategory('お菓子');
      });

      expect(result.current.customCategories).toEqual(['お菓子']);
    });

    it('DEFAULT_CATEGORIESに含まれるカテゴリは追加されない', () => {
      const { result } = renderHook(() => useStoreLayout());

      act(() => {
        result.current.addCustomCategory('野菜');
      });

      expect(result.current.customCategories).toEqual([]);
    });

    it('空文字・空白のみのカテゴリは追加されない', () => {
      const { result } = renderHook(() => useStoreLayout());

      act(() => {
        result.current.addCustomCategory('');
      });
      act(() => {
        result.current.addCustomCategory('   ');
      });

      expect(result.current.customCategories).toEqual([]);
    });

    it('カスタムカテゴリを削除できる', () => {
      const { result } = renderHook(() => useStoreLayout());

      act(() => {
        result.current.addCustomCategory('お菓子');
        result.current.addCustomCategory('ベビー用品');
      });

      act(() => {
        result.current.deleteCustomCategory('お菓子');
      });

      expect(result.current.customCategories).toEqual(['ベビー用品']);
    });

    it('削除がlocalStorageに反映される', () => {
      const { result } = renderHook(() => useStoreLayout());

      act(() => {
        result.current.addCustomCategory('お菓子');
      });

      act(() => {
        result.current.deleteCustomCategory('お菓子');
      });

      const stored = JSON.parse(
        localStorage.getItem('sgl:categories') || '[]',
      );
      expect(stored).toEqual([]);
    });
  });

  describe('allCategories', () => {
    it('DEFAULT_CATEGORIESとカスタムカテゴリの統合リストを返す（要件 7.2）', () => {
      const { result } = renderHook(() => useStoreLayout());

      act(() => {
        result.current.addCustomCategory('お菓子');
      });

      expect(result.current.allCategories).toEqual([
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
        'お菓子',
      ]);
    });

    it('カスタムカテゴリがない場合、DEFAULT_CATEGORIESのみを返す', () => {
      const { result } = renderHook(() => useStoreLayout());

      expect(result.current.allCategories).toEqual([
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
      ]);
    });
  });
});

describe('validateStoreLayout (standalone)', () => {
  it('通路が1つ以上ある場合、バリデーション成功', () => {
    const layout: StoreLayout = {
      id: 'test',
      storeName: 'テスト',
      aisles: [{ id: 'a1', name: '通路1', order: 0, sections: [] }],
    };

    const validationResult = validateStoreLayout(layout);
    expect(validationResult).toEqual({ valid: true, errors: [] });
  });

  it('通路が0の場合、バリデーション失敗', () => {
    const layout: StoreLayout = {
      id: 'test',
      storeName: 'テスト',
      aisles: [],
    };

    const validationResult = validateStoreLayout(layout);
    expect(validationResult).toEqual({
      valid: false,
      errors: ['通路を1つ以上登録してください'],
    });
  });
});
