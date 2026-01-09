import { ICON_BASE64 } from './icon-data';

/**
 * OG画像用のアイコンデータURLを取得
 * Base64エンコードされた画像データを返す
 */
export function getIconDataUrl() {
  return `data:image/png;base64,${ICON_BASE64}`;
}
