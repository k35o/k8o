export type OgMetadata = {
  title: string | undefined;
  description: string | undefined;
  imageUrl: string | undefined;
};

// 範囲外のコードポイントは String.fromCodePoint が RangeError を投げるため、
// 失敗時は元の文字列を返す（不正な実体参照で解析全体を止めない）
const codePointToString = (value: number, fallback: string): string => {
  try {
    return String.fromCodePoint(value);
  } catch {
    return fallback;
  }
};

const decodeHtmlEntities = (text: string): string =>
  text
    .replaceAll(/&lt;/giu, '<')
    .replaceAll(/&gt;/giu, '>')
    .replaceAll(/&quot;/giu, '"')
    .replaceAll(/&apos;/giu, "'")
    .replaceAll(/&nbsp;/giu, ' ')
    .replaceAll(/&#x([0-9a-f]+);/giu, (match: string, code: string) =>
      codePointToString(Number.parseInt(code, 16), match),
    )
    .replaceAll(/&#(\d+);/gu, (match: string, code: string) =>
      codePointToString(Number(code), match),
    )
    // &amp; は二重デコードを避けるため最後に処理する
    .replaceAll(/&amp;/giu, '&');

const parseAttributes = (tag: string): Map<string, string> => {
  const attributes = new Map<string, string>();
  // 量指定子の上限は ReDoS（多項式バックトラック）対策。現実の属性名には十分な長さ
  for (const match of tag.matchAll(
    /([\w:-]{1,100})\s{0,16}=\s{0,16}(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/giu,
  )) {
    const name = match[1]?.toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? '';
    if (name !== undefined && !attributes.has(name)) {
      attributes.set(name, value);
    }
  }
  return attributes;
};

const collectMetaContents = (html: string): Map<string, string> => {
  const contents = new Map<string, string>();
  for (const tagMatch of html.matchAll(/<meta\b[^>]*>/giu)) {
    const attributes = parseAttributes(tagMatch[0]);
    const key = (
      attributes.get('property') ?? attributes.get('name')
    )?.toLowerCase();
    const content = attributes.get('content');
    if (key !== undefined && content !== undefined && !contents.has(key)) {
      contents.set(key, content);
    }
  }
  return contents;
};

export const parseOgMetadata = (html: string, baseUrl?: string): OgMetadata => {
  const metas = collectMetaContents(html);

  const pick = (...keys: string[]): string | undefined => {
    for (const key of keys) {
      const value = metas.get(key);
      if (value !== undefined && value.trim() !== '') {
        return decodeHtmlEntities(value).trim();
      }
    }
    return undefined;
  };

  const rawDocTitle = /<title\b[^>]*>([\s\S]*?)<\/title>/iu.exec(html)?.[1];
  const docTitle =
    rawDocTitle === undefined
      ? undefined
      : decodeHtmlEntities(rawDocTitle).trim();

  const title =
    pick('og:title', 'twitter:title') ??
    (docTitle !== undefined && docTitle !== '' ? docTitle : undefined);

  const description = pick(
    'og:description',
    'twitter:description',
    'description',
  );

  let imageUrl = pick(
    'og:image',
    'og:image:url',
    'og:image:secure_url',
    'twitter:image',
    'twitter:image:src',
  );
  if (imageUrl !== undefined && baseUrl !== undefined) {
    try {
      imageUrl = new URL(imageUrl, baseUrl).toString();
    } catch {
      // 解決できない画像 URL はそのまま返す
    }
  }

  return { title, description, imageUrl };
};

if (import.meta.vitest) {
  describe('parseOgMetadata', () => {
    describe('正常系', () => {
      it('og:title / og:description / og:image を抽出する', () => {
        const html = `
          <meta property="og:title" content="記事タイトル" />
          <meta property="og:description" content="記事の説明" />
          <meta property="og:image" content="https://example.com/og.png" />
        `;
        expect(parseOgMetadata(html)).toEqual({
          title: '記事タイトル',
          description: '記事の説明',
          imageUrl: 'https://example.com/og.png',
        });
      });

      it('属性の並び順が content 先でも抽出できる', () => {
        const html =
          '<meta content="https://example.com/og.png" property="og:image">';
        expect(parseOgMetadata(html).imageUrl).toBe(
          'https://example.com/og.png',
        );
      });

      it('シングルクォートの属性でも抽出できる', () => {
        const html = "<meta property='og:title' content='シングル'>";
        expect(parseOgMetadata(html).title).toBe('シングル');
      });

      it('HTMLエンティティをデコードする', () => {
        const html =
          '<meta property="og:title" content="a &amp; b &#39;c&#39; &lt;d&gt;">';
        expect(parseOgMetadata(html).title).toBe("a & b 'c' <d>");
      });
    });

    describe('フォールバック', () => {
      it('og:title が無ければ twitter:title を使う', () => {
        const html = '<meta name="twitter:title" content="Twitterタイトル">';
        expect(parseOgMetadata(html).title).toBe('Twitterタイトル');
      });

      it('og:title も twitter:title も無ければ <title> を使う', () => {
        const html = '<head><title>ドキュメントタイトル</title></head>';
        expect(parseOgMetadata(html).title).toBe('ドキュメントタイトル');
      });

      it('og:description が無ければ name="description" を使う', () => {
        const html = '<meta name="description" content="標準の説明">';
        expect(parseOgMetadata(html).description).toBe('標準の説明');
      });
    });

    describe('相対URLの解決', () => {
      it('baseUrl を渡すと相対 og:image を絶対 URL に解決する', () => {
        const html = '<meta property="og:image" content="/images/og.png">';
        expect(
          parseOgMetadata(html, 'https://example.com/blog/post').imageUrl,
        ).toBe('https://example.com/images/og.png');
      });

      it('baseUrl が無ければ相対パスのまま返す', () => {
        const html = '<meta property="og:image" content="/images/og.png">';
        expect(parseOgMetadata(html).imageUrl).toBe('/images/og.png');
      });
    });

    describe('エッジケース', () => {
      it('該当するメタが無ければ全て undefined を返す', () => {
        expect(parseOgMetadata('<html><body>no meta</body></html>')).toEqual({
          title: undefined,
          description: undefined,
          imageUrl: undefined,
        });
      });

      it('content が空文字のメタは無視する', () => {
        const html = '<meta property="og:title" content="">';
        expect(parseOgMetadata(html).title).toBeUndefined();
      });

      it('= を伴わない長い記号列でも高速に処理できる（ReDoS 対策）', () => {
        const html = `<meta ${'-'.repeat(50_000)}>`;
        expect(parseOgMetadata(html)).toEqual({
          title: undefined,
          description: undefined,
          imageUrl: undefined,
        });
      });

      it('範囲外の数値実体参照でも例外を投げず元の文字列を返す', () => {
        const html =
          '<meta property="og:title" content="壊れた &#9999999999; 実体">';
        expect(parseOgMetadata(html).title).toBe('壊れた &#9999999999; 実体');
      });
    });
  });
}
