import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// satori はフォントの解析結果を data の参照ごとに使い回すので、
// 呼ぶたびに読まず、モジュールで1度だけ読んだものを返す
const font = readFileSync(
  join(process.cwd(), 'src/shared/og/fonts/m-plus-2-regular.ttf'),
);

export function getMPlus2Font(): Buffer {
  return font;
}
