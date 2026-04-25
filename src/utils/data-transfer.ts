import { STORAGE_KEYS } from '../constants';

/**
 * localStorageの全データをJSONファイルとしてエクスポートする。
 * ブラウザのダウンロード機能を使ってファイルを保存する。
 */
export function exportData(): void {
  const data: Record<string, string | null> = {};

  for (const key of Object.values(STORAGE_KEYS)) {
    data[key] = localStorage.getItem(key);
  }

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const filename = `kai-list-backup-${dateStr}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * JSONファイルからデータをインポートしてlocalStorageに書き込む。
 * ファイル選択ダイアログを開き、選択されたファイルを読み込む。
 * 成功したらページをリロードする。
 */
export function importData(): Promise<void> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve();
        return;
      }

      try {
        const text = await file.text();
        const data = JSON.parse(text) as Record<string, string | null>;

        // バリデーション: sgl: で始まるキーがあるか確認
        const validKeys = Object.values(STORAGE_KEYS) as string[];
        const hasValidKey = Object.keys(data).some((key) =>
          validKeys.includes(key),
        );

        if (!hasValidKey) {
          throw new Error('有効なバックアップファイルではありません');
        }

        // localStorageに書き込み
        for (const [key, value] of Object.entries(data)) {
          if (value !== null && value !== undefined) {
            localStorage.setItem(key, value);
          }
        }

        window.location.reload();
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    input.click();
  });
}
