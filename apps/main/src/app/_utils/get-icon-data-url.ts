import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * OG画像用のアイコンデータURLを取得
 * ビルド時にファイルシステムから読み込んでBase64エンコード
 */
export async function getIconDataUrl() {
  const iconPath = join(process.cwd(), 'apps/main/src/app/icon.png');
  const iconBase64 = await readFile(iconPath, 'base64');
  return `data:image/png;base64,${iconBase64}`;
}
