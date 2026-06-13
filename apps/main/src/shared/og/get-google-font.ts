import { cacheLife } from 'next/cache';

type GoogleFontParams = {
  family: string;
  weight: number;
  text: string;
};

function buildCssUrl({ family, weight, text }: GoogleFontParams): string {
  const familyParam = `${family.replaceAll(' ', '+')}:wght@${weight.toString()}`;
  // 同じグリフ集合でキャッシュが効くよう、文字を重複排除・ソートしてサブセット化する
  const subset = [...new Set(text)].toSorted().join('');
  return `https://fonts.googleapis.com/css2?family=${familyParam}&display=swap&text=${encodeURIComponent(subset)}`;
}

function extractFontUrl(css: string): string {
  const match =
    /src:\s*url\(["']?([^"')]+)["']?\)\s*format\('(?:woff2|woff|opentype|truetype)'\)/u.exec(
      css,
    );

  if (match?.[1] === undefined) {
    throw new Error('Failed to parse font URL from Google Fonts CSS');
  }

  return match[1];
}

// cacheComponents 下では未キャッシュの fetch を static prerender で行うと、
// プリレンダー完了時に未解決の promise が HANGING_PROMISE_REJECTION で弾かれる。
// 'use cache' でフォント取得をキャッシュ境界に閉じ込め、ビルドを決定的にする。
export async function getGoogleFont(
  params: GoogleFontParams,
): Promise<ArrayBuffer> {
  'use cache';
  cacheLife('max');

  const cssResponse = await fetch(buildCssUrl(params));
  if (!cssResponse.ok) {
    throw new Error(`Failed to fetch Google Fonts CSS: ${cssResponse.status}`);
  }

  const fontResponse = await fetch(extractFontUrl(await cssResponse.text()));
  if (!fontResponse.ok) {
    throw new Error(`Failed to fetch font file: ${fontResponse.status}`);
  }

  return fontResponse.arrayBuffer();
}
