import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * OG画像用のアイコンデータURLを取得
 * ビルド時にファイルシステムから読み込んでBase64エンコード
 */
export async function getIconDataUrl() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const iconPath = join(__dirname, '../icon.png');
  const iconBase64 = await readFile(iconPath, 'base64');
  return `data:image/png;base64,${iconBase64}`;
}
