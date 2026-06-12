const cssCache = new Map<string, Promise<string>>();
const fontCache = new Map<string, Promise<ArrayBuffer>>();

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

function fetchGoogleFontsCss(url: string): Promise<string> {
  const cachedCss = cssCache.get(url);
  if (cachedCss) {
    return cachedCss;
  }

  const cssPromise = fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch Google Fonts CSS: ${response.status}`);
      }
      return response.text();
    })
    .catch((error: unknown) => {
      cssCache.delete(url);
      throw error;
    });

  cssCache.set(url, cssPromise);
  return cssPromise;
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

export function getGoogleFont(params: GoogleFontParams): Promise<ArrayBuffer> {
  const cacheKey = buildCssUrl(params);
  const cachedFont = fontCache.get(cacheKey);
  if (cachedFont) {
    return cachedFont;
  }

  const fontPromise = fetchGoogleFontsCss(cacheKey)
    .then(extractFontUrl)
    .then((fontUrl) => fetch(fontUrl))
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch font file: ${response.status}`);
      }
      return response.arrayBuffer();
    })
    .catch((error: unknown) => {
      fontCache.delete(cacheKey);
      throw error;
    });

  fontCache.set(cacheKey, fontPromise);
  return fontPromise;
}
