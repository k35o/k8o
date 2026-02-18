const cssCache = new Map<string, Promise<string>>();
const fontCache = new Map<string, Promise<ArrayBuffer>>();

async function fetchGoogleFontsCss({
  text,
}: {
  text: string;
}): Promise<string> {
  const cacheKey = text;
  const cachedCss = cssCache.get(cacheKey);
  if (cachedCss) {
    return await cachedCss;
  }

  const cssPromise = fetch(
    `https://fonts.googleapis.com/css2?family=M+PLUS+2:wght@450&display=swap&text=${encodeURIComponent(text)}`,
  ).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Failed to fetch Google Fonts CSS: ${response.status}`);
    }
    return await response.text();
  });

  cssCache.set(cacheKey, cssPromise);
  return await cssPromise;
}

function extractFontUrl(css: string): string {
  const match =
    /src:\s*url\(([^)]+)\)\s*format\('(?:woff2|woff|opentype|truetype)'\)/.exec(
      css,
    );

  if (!match?.[1]) {
    throw new Error('Failed to parse font URL from Google Fonts CSS');
  }

  return match[1];
}

export async function getMPlus2Font({
  text,
}: {
  text: string;
}): Promise<ArrayBuffer> {
  const cacheKey = text;
  const cachedFont = fontCache.get(cacheKey);
  if (cachedFont) {
    return await cachedFont;
  }

  const fontPromise = fetchGoogleFontsCss({ text })
    .then(extractFontUrl)
    .then(async (fontUrl) => {
      const response = await fetch(fontUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch font file: ${response.status}`);
      }
      return await response.arrayBuffer();
    });

  fontCache.set(cacheKey, fontPromise);
  return await fontPromise;
}
