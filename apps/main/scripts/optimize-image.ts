// 画像を AVIF に変換する。記事やページの画像は変換した AVIF をコミットし、素の img に width と height を書いて描く。
//
// 実行: pnpm run -F main optimize:image <入力> <出力.avif> [--max-width <px>] [--widths <px>,<px>...]
// --max-width を超える画像は、縦横比を保って縮める（小さい画像は広げない）。書いた画像の width と height を出す。
// 出力より狭い --widths（既定は 640,960,1280）の幅ごとに、srcset の版 <出力の名前>.<幅>w.avif も書く。
// 入力と出力が同じファイルなら、出力は書き直さずに版だけを書く。

import { stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';

import sharp from 'sharp';
import type { Sharp } from 'sharp';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    'max-width': { type: 'string' },
    widths: { type: 'string', default: '640,960,1280' },
  },
});

const [input, output] = positionals;
const maxWidth =
  values['max-width'] === undefined ? undefined : Number(values['max-width']);
const widths = values.widths.split(',').map(Number);

const isPositiveInteger = (value: number): boolean =>
  Number.isInteger(value) && value > 0;

if (
  positionals.length !== 2 ||
  input === undefined ||
  output === undefined ||
  !output.endsWith('.avif') ||
  (maxWidth !== undefined && !isPositiveInteger(maxWidth)) ||
  !widths.every(isPositiveInteger)
) {
  throw new Error(
    '使い方: pnpm run -F main optimize:image <入力> <出力.avif> [--max-width <px>] [--widths <px>,<px>...]',
  );
}

const source = (): Sharp => sharp(input).autoOrient();

// 既定の 50 は、白い文字の縁に色がにじむ
const encode = (image: Sharp): Sharp => image.avif({ quality: 65 });

if (resolve(input) !== resolve(output)) {
  await encode(
    maxWidth === undefined
      ? source()
      : source().resize({ width: maxWidth, withoutEnlargement: true }),
  ).toFile(output);
}

const { width, height } = await sharp(output).metadata();
const { size } = await stat(output);

process.stdout.write(
  `${output}: width={${String(width)}} height={${String(height)}}\n`,
);

for (const variantWidth of widths.filter((value) => value < width)) {
  const variant = output.replace(/\.avif$/u, `.${String(variantWidth)}w.avif`);
  const encoded = await encode(
    source().resize({ width: variantWidth }),
  ).toBuffer();
  // 縮めても AVIF がほとんど小さくならない画像がある。元と変わらない版は、配っても得が無い
  if (encoded.byteLength <= size * 0.9) {
    await writeFile(variant, encoded);
    process.stdout.write(`${variant}\n`);
  }
}
