import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// satori はフォントの解析結果を data の参照ごとに使い回すので、呼ぶたびに読まず、モジュールで 1 度だけ
// 読んだものを返す
const readAsset = (path: string): Buffer =>
  readFileSync(join(process.cwd(), path));

const mPlus2Font = readAsset('src/shared/og/fonts/m-plus-2-regular.ttf');
const jetBrainsMonoFont = readAsset(
  'src/shared/og/fonts/jetbrains-mono-regular.ttf',
);
const iconDataUrl = `data:image/png;base64,${readAsset('public/icon.png').toString('base64')}`;

export const getMPlus2Font = (): Buffer => mPlus2Font;

export const getJetBrainsMonoFont = (): Buffer => jetBrainsMonoFont;

export const getIconDataUrl = (): string => iconDataUrl;
