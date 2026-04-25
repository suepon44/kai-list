import { renderHook, act } from '@testing-library/react';
import { useMealPlan } from '../useMealPlan';

// localStorage をテストごとにクリアする
beforeEach(() => {
  localStorage.clear();
});

describe('useMealPlan', () => {
  describe('初期状態', () => {
    it('空の週間献立で初期化される', () => {
      const { result } = renderHook(() => useMealPlan());
      expect(result.current.currentPlan).toEqual({
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      });
    });

    it('保存済み献立一覧が空配列で初期化される', () => {
      const { result } = renderHook(() => useMealPlan());
      expect(result.current.savedPlans).toEqual([]);
    });

    it('localStorageに既存データがある場合、savedPlansに読み込む', () => {
      const existing = [
        {
          id: 'plan-1',
          name: '今週の献立',
          plan: {
            monday: ['recipe-1'],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
          },
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('sgl:meal-plans', JSON.stringify(existing));

      const { result } = renderHook(() => useMealPlan());
      expect(result.current.savedPlans).toHaveLength(1);
      expect(result.current.savedPlans[0].name).toBe('今週の献立');
    });
  });

  describe('assignRecipe', () => {
    it('指定した曜日にレシピを割り当てられる', () => {
      const { result } = renderHook(() => useMealPlan());

      act(() => {
        result.current.assignRecipe('monday', 'recipe-1');
      });

      expect(result.current.currentPlan.monday).toEqual(['recipe-1']);
    });

    it('同じ曜日に複数のレシピを割り当てられる', () => {
      const { result } = renderHook(() => useMealPlan());

      act(() => {
        result.current.assignRecipe('monday', 'recipe-1');
      });
      act(() => {
        result.current.assignRecipe('monday', 'recipe-2');
      });

      expect(result.current.currentPlan.monday).toEqual([
        'recipe-1',
        'recipe-2',
      ]);
    });

    it('異なる曜日にレシピを割り当てられる', () => {
      const { result } = renderHook(() => useMealPlan());

      act(() => {
        result.current.assignRecipe('monday', 'recipe-1');
      });
      act(() => {
        result.current.assignRecipe('friday', 'recipe-2');
      });

      expect(result.current.currentPlan.monday).toEqual(['recipe-1']);
      expect(result.current.currentPlan.friday).toEqual(['recipe-2']);
    });

    it('他の曜日のレシピに影響しない', () => {
      const { result } = renderHook(() => useMealPlan());

      act(() => {
        result.current.assignRecipe('wednesday', 'recipe-1');
      });

      expect(result.current.currentPlan.monday).toEqual([]);
      expect(result.current.currentPlan.tuesday).toEqual([]);
      expect(result.current.currentPlan.thursday).toEqual([]);
      expect(result.current.currentPlan.friday).toEqual([]);
    });
  });

  describe('removeRecipe', () => {
    it('指定した曜日からレシピを削除できる', () => {
      const { result } = renderHook(() => useMealPlan());

      act(() => {
        result.current.assignRecipe('monday', 'recipe-1');
      });
      act(() => {
        result.current.removeRecipe('monday', 'recipe-1');
      });

      expect(result.current.currentPlan.monday).toEqual([]);
    });

    it('同じレシピIDが複数ある場合、最初の1つのみ削除する', () => {
      const { result } = renderHook(() => useMealPlan());

      act(() => {
        result.current.assignRecipe('monday', 'recipe-1');
      });
      act(() => {
        result.current.assignRecipe('monday', 'recipe-1');
      });
      act(() => {
        result.current.removeRecipe('monday', 'recipe-1');
      });

      expect(result.current.currentPlan.monday).toEqual(['recipe-1']);
    });

    it('存在しないレシピIDを削除しても状態が変わらない', () => {
      const { result } = renderHook(() => useMealPlan());

      act(() => {
        result.current.assignRecipe('monday', 'recipe-1');
      });
      act(() => {
        result.current.removeRecipe('monday', 'non-existent');
      });

      expect(result.current.currentPlan.monday).toEqual(['recipe-1']);
    });
  });

  describe('savePlan', () => {
    it('現在の献立を名前付きで保存できる', () => {
      const { result } = renderHook(() => useMealPlan());

      act(() => {
        result.current.assignRecipe('monday', 'recipe-1');
      });
      act(() => {
        result.current.savePlan('今週の献立');
      });

      expect(result.current.savedPlans).toHaveLength(1);
      expect(result.current.savedPlans[0].name).toBe('今週の献立');
      expect(result.current.savedPlans[0].plan.monday).toEqual([
        'recipe-1',
      ]);
    });

    it('保存された献立にid, createdAtが付与される', () => {
      const { result } = renderHook(() => useMealPlan());

      act(() => {
        result.current.savePlan('テスト献立');
      });

      const saved = result.current.savedPlans[0];
      expect(saved.id).toBeDefined();
      expect(saved.createdAt).toBeDefined();
    });

    it('localStorageにデータが永続化される', () => {
      const { result } = renderHook(() => useMealPlan());

      act(() => {
        result.current.assignRecipe('tuesday', 'recipe-2');
      });
      act(() => {
        result.current.savePlan('永続化テスト');
      });

      const stored = JSON.parse(
        localStorage.getItem('sgl:meal-plans') || '[]'
      );
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe('永続化テスト');
    });

    it('複数の献立を保存できる', () => {
      const { result } = renderHook(() => useMealPlan());

      act(() => {
        result.current.savePlan('献立A');
      });
      act(() => {
        result.current.savePlan('献立B');
      });

      expect(result.current.savedPlans).toHaveLength(2);
    });
  });

  describe('loadPlan', () => {
    it('保存済み献立をcurrentPlanに読み込める', () => {
      const { result } = renderHook(() => useMealPlan());

      act(() => {
        result.current.assignRecipe('monday', 'recipe-1');
      });
      act(() => {
        result.current.assignRecipe('friday', 'recipe-2');
      });
      act(() => {
        result.current.savePlan('テスト献立');
      });

      // リセットしてから読み込み
      act(() => {
        result.current.resetPlan();
      });
      expect(result.current.currentPlan.monday).toEqual([]);

      const planId = result.current.savedPlans[0].id;
      act(() => {
        result.current.loadPlan(planId);
      });

      expect(result.current.currentPlan.monday).toEqual(['recipe-1']);
      expect(result.current.currentPlan.friday).toEqual(['recipe-2']);
    });

    it('存在しないIDの場合、currentPlanが変わらない', () => {
      const { result } = renderHook(() => useMealPlan());

      act(() => {
        result.current.assignRecipe('monday', 'recipe-1');
      });
      act(() => {
        result.current.loadPlan('non-existent-id');
      });

      expect(result.current.currentPlan.monday).toEqual(['recipe-1']);
    });
  });

  describe('deletePlan', () => {
    it('保存済み献立を削除できる', () => {
      const { result } = renderHook(() => useMealPlan());

      act(() => {
        result.current.savePlan('削除テスト');
      });

      const planId = result.current.savedPlans[0].id;

      act(() => {
        result.current.deletePlan(planId);
      });

      expect(result.current.savedPlans).toHaveLength(0);
    });

    it('削除がlocalStorageに反映される', () => {
      const { result } = renderHook(() => useMealPlan());

      act(() => {
        result.current.savePlan('削除テスト');
      });

      const planId = result.current.savedPlans[0].id;

      act(() => {
        result.current.deletePlan(planId);
      });

      const stored = JSON.parse(
        localStorage.getItem('sgl:meal-plans') || '[]'
      );
      expect(stored).toHaveLength(0);
    });
  });

  describe('overwritePlan', () => {
    it('既存の保存済み献立を現在の内容で上書きできる', () => {
      const { result } = renderHook(() => useMealPlan());

      // 最初の献立を保存
      act(() => {
        result.current.assignRecipe('monday', 'recipe-1');
      });
      act(() => {
        result.current.savePlan('上書きテスト');
      });

      const planId = result.current.savedPlans[0].id;

      // 現在の献立を変更してから上書き
      act(() => {
        result.current.resetPlan();
      });
      act(() => {
        result.current.assignRecipe('friday', 'recipe-2');
      });
      act(() => {
        result.current.overwritePlan(planId);
      });

      expect(result.current.savedPlans[0].plan.monday).toEqual([]);
      expect(result.current.savedPlans[0].plan.friday).toEqual([
        'recipe-2',
      ]);
    });

    it('上書き後も献立名とIDが保持される', () => {
      const { result } = renderHook(() => useMealPlan());

      act(() => {
        result.current.savePlan('名前保持テスト');
      });

      const planId = result.current.savedPlans[0].id;
      const planName = result.current.savedPlans[0].name;

      act(() => {
        result.current.assignRecipe('wednesday', 'recipe-3');
      });
      act(() => {
        result.current.overwritePlan(planId);
      });

      expect(result.current.savedPlans[0].id).toBe(planId);
      expect(result.current.savedPlans[0].name).toBe(planName);
    });

    it('存在しないIDの場合、何もしない', () => {
      const { result } = renderHook(() => useMealPlan());

      act(() => {
        result.current.savePlan('テスト');
      });

      act(() => {
        result.current.overwritePlan('non-existent-id');
      });

      expect(result.current.savedPlans).toHaveLength(1);
    });
  });

  describe('resetPlan', () => {
    it('現在の献立を空にリセットできる', () => {
      const { result } = renderHook(() => useMealPlan());

      act(() => {
        result.current.assignRecipe('monday', 'recipe-1');
      });
      act(() => {
        result.current.assignRecipe('friday', 'recipe-2');
      });
      act(() => {
        result.current.resetPlan();
      });

      expect(result.current.currentPlan).toEqual({
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      });
    });

    it('リセットしてもsavedPlansに影響しない', () => {
      const { result } = renderHook(() => useMealPlan());

      act(() => {
        result.current.assignRecipe('monday', 'recipe-1');
      });
      act(() => {
        result.current.savePlan('リセットテスト');
      });
      act(() => {
        result.current.resetPlan();
      });

      expect(result.current.savedPlans).toHaveLength(1);
      expect(result.current.savedPlans[0].plan.monday).toEqual([
        'recipe-1',
      ]);
    });
  });
});
