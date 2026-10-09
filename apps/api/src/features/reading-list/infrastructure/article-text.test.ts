import { safeFetch } from '@repo/helpers/url/safe-fetch';

import { extractArticleText, fetchArticleText } from './article-text';

vi.mock('@repo/helpers/url/safe-fetch', () => ({
  safeFetch: vi.fn(),
}));

const BODY_START = 'BODY_START: This is the first sentence of the article.';

const paragraphs = (count: number): string =>
  Array.from(
    { length: count },
    (_, i) =>
      `<p>Paragraph ${i} explains the change in more detail, with examples, numbers, and the reasoning behind each decision.</p>`,
  ).join('');

const articleBody = `<p>${BODY_START}</p>${paragraphs(8)}`;

const page = (body: string): string =>
  `<!doctype html><html><head><title>Post</title></head><body>${body}</body></html>`;

const htmlResponse = (
  html: string,
  { status = 200, contentType = 'text/html; charset=utf-8' } = {},
): Response =>
  new Response(html, { status, headers: { 'content-type': contentType } });

describe('extractArticleText', () => {
  describe('正常系', () => {
    it('記事の本文を、段落の境目を空白で区切ったテキストで返す', () => {
      const text = extractArticleText(
        page(`<main><article><h1>Title</h1>${articleBody}</article></main>`),
      );

      expect(text).toContain(`${BODY_START} Paragraph 0 explains`);
      expect(text).toContain('Paragraph 7 explains');
      expect(text).not.toMatch(/\s{2,}/u);
    });

    it('記事の中にあるタグ一覧のナビゲーションを含めない（blog.cloudflare.com の構造）', () => {
      const tags = Array.from(
        { length: 300 },
        (_, i) => `<li><a href="/tag/${i}">TagName${i}</a></li>`,
      ).join('');
      const text = extractArticleText(
        page(
          `<main><article><div class="post-content"><header><nav class="breadcrumb"><details><summary>All tags</summary><ul>${tags}</ul></details></nav></header><h1>Title</h1><div class="article-content">${articleBody}</div></div></article></main>`,
        ),
      );

      expect(text.indexOf(BODY_START)).toBeLessThan(100);
      expect(text).not.toContain('TagName');
    });

    it('class の無いヘッダーのメニューを含めず、入れ子の body の本文を取る（github.blog の構造）', () => {
      const menu = Array.from(
        { length: 30 },
        (_, i) =>
          `<a href="/cat${i}">Category ${i}</a><p>Learn about category ${i} across the ecosystem and the wider industry.</p>`,
      ).join('');
      const text = extractArticleText(
        page(
          `<header><nav aria-label="Primary navigation">${menu}</nav></header><main><header><h1>Title</h1></header><section><html><body>${articleBody}</body></html></section><article class="author-bio"><p>About the author.</p></article><aside><article><p>Related post.</p></article></aside></main>`,
        ),
      );

      expect(text.indexOf(BODY_START)).toBeLessThan(100);
      expect(text).not.toContain('Learn about category');
      expect(text).not.toContain('Related post');
    });

    it('記事の header にあるリード文を残す', () => {
      const lead =
        'LEAD: A short summary written by the author, placed in the article header right below the title.';
      const text = extractArticleText(
        page(
          `<main><article><header><h1>Title</h1><p class="lede">${lead}</p></header>${articleBody}</article></main>`,
        ),
      );

      expect(text).toContain(lead);
    });
  });

  describe('異常系', () => {
    it('JavaScript で描画するだけのページは空文字になる', () => {
      const text = extractArticleText(
        page('<div id="root"></div><script>render()</script>'),
      );

      expect(text).toBe('');
    });
  });

  describe('エッジケース', () => {
    it('HTML の文字参照を元の文字に戻す', () => {
      const text = extractArticleText(
        page(
          `<article><p>The &lt;select&gt; element&#x27;s new styling hooks &amp; more.</p>${articleBody}</article>`,
        ),
      );

      expect(text).toContain(
        "The <select> element's new styling hooks & more.",
      );
    });

    it('main も article も無く、本文の途中にデモの article が並ぶページでも本文を取る', () => {
      const cards = Array.from(
        { length: 3 },
        () =>
          '<article class="card"><h3>Section title</h3><p>Some text in here to mimic nothing.</p></article>',
      ).join('');
      const text = extractArticleText(
        page(
          `<div class="post-content prose"><h1>Title</h1>${articleBody}<div class="demo">${cards}</div>${paragraphs(4)}</div>`,
        ),
      );

      expect(text.indexOf(BODY_START)).toBeLessThan(100);
      expect(text.length).toBeGreaterThan(1000);
    });
  });
});

describe('fetchArticleText', () => {
  describe('正常系', () => {
    it('タイムアウトと UA を付けて取得し、本文を取り出す', async () => {
      vi.mocked(safeFetch).mockResolvedValue(
        htmlResponse(page(`<article>${articleBody}</article>`)),
      );

      const result = await fetchArticleText('https://example.com/a');

      expect(result).toStrictEqual({
        ok: true,
        text: expect.stringContaining(BODY_START),
      });
      expect(safeFetch).toHaveBeenCalledWith('https://example.com/a', {
        signal: expect.any(AbortSignal),
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; k8o-bot/1.0; +https://k8o.me)',
          Accept: 'text/html,application/xhtml+xml',
        },
      });
    });
  });

  describe('異常系', () => {
    it('ステータスが ok でなければ、理由を付けて失敗を返す', async () => {
      vi.mocked(safeFetch).mockResolvedValue(htmlResponse('', { status: 404 }));

      await expect(
        fetchArticleText('https://example.com/a'),
      ).resolves.toStrictEqual({ ok: false, reason: 'HTTP 404' });
    });

    it('HTML でなければ、本文を読まずに失敗を返す', async () => {
      vi.mocked(safeFetch).mockResolvedValue(
        htmlResponse('%PDF-1.7', { contentType: 'application/pdf' }),
      );

      await expect(
        fetchArticleText('https://example.com/a'),
      ).resolves.toStrictEqual({
        ok: false,
        reason: 'HTML ではない（application/pdf）',
      });
    });

    it('取得に失敗したら、例外のメッセージを理由にして失敗を返す', async () => {
      vi.mocked(safeFetch).mockRejectedValue(new Error('timeout'));

      await expect(
        fetchArticleText('https://example.com/a'),
      ).resolves.toStrictEqual({ ok: false, reason: 'timeout' });
    });
  });

  describe('エッジケース', () => {
    it('終わらない応答も上限で読むのをやめ、それまでの本文を使う', async () => {
      const encoder = new TextEncoder();
      const filler = encoder.encode(`<!-- ${'x'.repeat(1_000_000)} -->`);
      let chunks = 0;
      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(
            encoder.encode(page(`<article>${articleBody}</article>`)),
          );
        },
        pull(controller) {
          chunks += 1;
          controller.enqueue(filler);
        },
      });
      vi.mocked(safeFetch).mockResolvedValue(
        new Response(body, { headers: { 'content-type': 'text/html' } }),
      );

      const result = await fetchArticleText('https://example.com/a');

      expect(result).toStrictEqual({
        ok: true,
        text: expect.stringContaining(BODY_START),
      });
      expect(chunks).toBeLessThan(10);
    });
  });
});
