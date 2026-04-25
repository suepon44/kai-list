/**
 * localStorage を使用した汎用リポジトリ。
 * 各エンティティタイプごとにキーを分けて保存する。
 * JSON シリアライズ/デシリアライズを内部で行う。
 */

/** データ永続化エラー */
export class StorageError extends Error {
  readonly cause?: unknown;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'StorageError';
    this.cause = options?.cause;
  }
}

/** リポジトリインターフェース */
export interface Repository<T> {
  getAll(): T[];
  getById(id: string): T | null;
  save(item: T): void;
  update(id: string, item: T): void;
  delete(id: string): void;
}

/** localStorage を使用した汎用リポジトリ実装 */
export class LocalStorageRepository<T extends { id: string }>
  implements Repository<T>
{
  constructor(private storageKey: string) {}

  /**
   * 全アイテムを取得する。
   * ストレージが空の場合は空配列を返す。
   */
  getAll(): T[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data === null) return [];
      return JSON.parse(data) as T[];
    } catch (error) {
      if (this.isSecurityError(error)) {
        throw new StorageError('ストレージにアクセスできません', {
          cause: error,
        });
      }
      throw new StorageError('データの読み込みに失敗しました', {
        cause: error,
      });
    }
  }

  /**
   * IDでアイテムを取得する。
   * 見つからない場合は null を返す。
   */
  getById(id: string): T | null {
    const items = this.getAll();
    return items.find((item) => item.id === id) ?? null;
  }

  /**
   * 新しいアイテムを保存する。
   */
  save(item: T): void {
    const items = this.getAll();
    items.push(item);
    this.writeAll(items);
  }

  /**
   * 既存のアイテムを更新する。
   * 指定されたIDのアイテムが見つからない場合はエラーをスローする。
   */
  update(id: string, item: T): void {
    const items = this.getAll();
    const index = items.findIndex((existing) => existing.id === id);
    if (index === -1) {
      throw new StorageError(
        `ID "${id}" のアイテムが見つかりません`
      );
    }
    items[index] = item;
    this.writeAll(items);
  }

  /**
   * アイテムを削除する。
   * 指定されたIDのアイテムが見つからない場合はエラーをスローする。
   */
  delete(id: string): void {
    const items = this.getAll();
    const index = items.findIndex((existing) => existing.id === id);
    if (index === -1) {
      throw new StorageError(
        `ID "${id}" のアイテムが見つかりません`
      );
    }
    items.splice(index, 1);
    this.writeAll(items);
  }

  /**
   * 全アイテムをlocalStorageに書き込む。
   * 容量超過、アクセス不可のエラーをハンドリングする。
   */
  private writeAll(items: T[]): void {
    try {
      const serialized = JSON.stringify(items);
      localStorage.setItem(this.storageKey, serialized);
    } catch (error) {
      if (this.isQuotaExceededError(error)) {
        throw new StorageError('ストレージの容量が不足しています', {
          cause: error,
        });
      }
      if (this.isSecurityError(error)) {
        throw new StorageError('ストレージにアクセスできません', {
          cause: error,
        });
      }
      throw new StorageError('データの保存に失敗しました', {
        cause: error,
      });
    }
  }

  /**
   * localStorage 容量超過エラーかどうかを判定する。
   */
  private isQuotaExceededError(error: unknown): boolean {
    return (
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' ||
        error.code === 22 ||
        error.code === 1014)
    );
  }

  /**
   * localStorage アクセス不可（セキュリティ）エラーかどうかを判定する。
   */
  private isSecurityError(error: unknown): boolean {
    return (
      error instanceof DOMException &&
      (error.name === 'SecurityError' || error.code === 18)
    );
  }
}
