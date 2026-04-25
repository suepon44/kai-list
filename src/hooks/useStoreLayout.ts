import { useState, useCallback, useMemo } from 'react';
import type { StoreLayout, ValidationResult } from '../types';
import { LocalStorageRepository } from '../repositories/local-storage';
import { DEFAULT_CATEGORIES, STORAGE_KEYS } from '../constants';

const storeLayoutRepository = new LocalStorageRepository<StoreLayout>(
  STORAGE_KEYS.STORE_LAYOUTS,
);

/**
 * localStorage からカスタムカテゴリを読み込む。
 * 読み込みに失敗した場合は空配列を返す。
 */
function loadCustomCategories(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

/**
 * カスタムカテゴリを localStorage に保存する。
 */
function saveCustomCategories(categories: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch {
    // localStorage 書き込み失敗は無視する（容量超過等）
  }
}

/**
 * 店舗レイアウトのバリデーション。
 * 通路が1つ以上登録されていることを検証する（要件 6.6）。
 */
export function validateStoreLayout(layout: StoreLayout): ValidationResult {
  const errors: string[] = [];

  if (!layout.aisles || layout.aisles.length === 0) {
    errors.push('通路を1つ以上登録してください');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 店舗レイアウトのCRUD操作、通路・セクション管理、
 * カスタム商品カテゴリ管理を提供するカスタムフック。
 *
 * - 店舗レイアウトの追加・更新・削除・取得
 * - 通路が1つ以上あることのバリデーション（要件 6.6）
 * - カスタム商品カテゴリの追加・削除
 * - DEFAULT_CATEGORIES + カスタムカテゴリの統合リスト
 */
export function useStoreLayout() {
  const [storeLayouts, setStoreLayouts] = useState<StoreLayout[]>(() =>
    storeLayoutRepository.getAll(),
  );
  const [customCategories, setCustomCategories] = useState<string[]>(
    loadCustomCategories,
  );

  /**
   * 新しい店舗レイアウトを作成する。
   * 空の通路リストで作成し、後から通路を追加する想定。
   * 返り値は作成された StoreLayout。
   */
  const addStoreLayout = useCallback((storeName: string): StoreLayout => {
    const newLayout: StoreLayout = {
      id: crypto.randomUUID(),
      storeName,
      aisles: [],
    };
    storeLayoutRepository.save(newLayout);
    setStoreLayouts(storeLayoutRepository.getAll());
    return newLayout;
  }, []);

  /**
   * 既存の店舗レイアウトを更新する。
   * バリデーションは呼び出し側で行う想定（validateStoreLayout を使用）。
   */
  const updateStoreLayout = useCallback(
    (id: string, layout: StoreLayout): void => {
      storeLayoutRepository.update(id, layout);
      setStoreLayouts(storeLayoutRepository.getAll());
    },
    [],
  );

  /**
   * 店舗レイアウトを削除する。
   */
  const deleteStoreLayout = useCallback((id: string): void => {
    storeLayoutRepository.delete(id);
    setStoreLayouts(storeLayoutRepository.getAll());
  }, []);

  /**
   * IDで店舗レイアウトを取得する。
   * 見つからない場合は null を返す。
   */
  const getStoreLayout = useCallback(
    (id: string): StoreLayout | null => {
      return storeLayouts.find((layout) => layout.id === id) ?? null;
    },
    [storeLayouts],
  );

  /**
   * カスタム商品カテゴリを追加する。
   * 既に存在する場合（DEFAULT_CATEGORIES またはカスタム）は追加しない。
   */
  const addCustomCategory = useCallback(
    (category: string): void => {
      const trimmed = category.trim();
      if (!trimmed) return;

      // DEFAULT_CATEGORIES に既に存在する場合はスキップ
      if (
        (DEFAULT_CATEGORIES as readonly string[]).includes(trimmed)
      ) {
        return;
      }

      setCustomCategories((prev) => {
        if (prev.includes(trimmed)) return prev;
        const next = [...prev, trimmed];
        saveCustomCategories(next);
        return next;
      });
    },
    [],
  );

  /**
   * カスタム商品カテゴリを削除する。
   * DEFAULT_CATEGORIES に含まれるカテゴリは削除できない。
   */
  const deleteCustomCategory = useCallback((category: string): void => {
    setCustomCategories((prev) => {
      const next = prev.filter((c) => c !== category);
      saveCustomCategories(next);
      return next;
    });
  }, []);

  /**
   * DEFAULT_CATEGORIES + カスタムカテゴリの統合リスト。
   */
  const allCategories = useMemo(
    () => [...DEFAULT_CATEGORIES, ...customCategories],
    [customCategories],
  );

  return {
    storeLayouts,
    addStoreLayout,
    updateStoreLayout,
    deleteStoreLayout,
    getStoreLayout,
    validateStoreLayout,
    customCategories,
    addCustomCategory,
    deleteCustomCategory,
    allCategories,
  };
}
