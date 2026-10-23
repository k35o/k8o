// 画像を AVIF に変換する。記事やページの画像は変換した AVIF をコミットし、素の img に width と height を書いて描く。
//
// 実行: pnpm run -F main optimize:image <入力> <出力.avif> [--max-width <px>]
// --max-width を超える画像は、縦横比を保って縮める（小さい画像は広げない）。書いた画像の width と height を出す。

import { parseArgs } from 'node:util';

import sharp from 'sharp';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { 'max-width': { type: 'string' } },
});

const [input, output] = positionals;
const maxWidth =
  values['max-width'] === undefined ? undefined : Number(values['max-width']);

if (
  positionals.length !== 2 ||
  input === undefined ||
  output === undefined ||
  !output.endsWith('.avif') ||
  (maxWidth !== undefined && !(Number.isInteger(maxWidth) && maxWidth > 0))
) {
  throw new Error(
    '使い方: pnpm run -F main optimize:image <入力> <出力.avif> [--max-width <px>]',
  );
}

const image = sharp(input).autoOrient();
const { width, height } = await (
  maxWidth === undefined
    ? image
    : image.resize({ width: maxWidth, withoutEnlargement: true })
)
  // 既定の 50 は、白い文字の縁に色がにじむ
  .avif({ quality: 65 })
  .toFile(output);

process.stdout.write(
  `${output}: width={${String(width)}} height={${String(height)}}\n`,
);
