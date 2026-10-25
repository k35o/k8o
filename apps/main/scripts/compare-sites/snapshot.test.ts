import { describe, expect, it } from 'vitest';

import { takeSnapshot } from './snapshot';
import type { RawResponse, Snapshot } from './snapshot';

const encode = (text: string): Uint8Array => new TextEncoder().encode(text);

const response = (
  contentType: string | null,
  body: Uint8Array,
): RawResponse => ({
  url: 'http://localhost:3001/about',
  status: 200,
  contentType,
  location: null,
  body,
});

const htmlSnapshot = (body: string): Snapshot =>
  takeSnapshot(
    response(
      'text/html; charset=utf-8',
      encode(`<!DOCTYPE html><html lang="ja">${body}</html>`),
    ),
  );

// シグネチャと IHDR チャンクの先頭（長さ・型・幅・高さ）だけの PNG
const pngHeader = (width: number, height: number): Uint8Array => {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  bytes.set([0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52], 8);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return bytes;
};

describe('takeSnapshot', () => {
  describe('HTML', () => {
    describe('正常系', () => {
      it('head の title・description・canonical・alternate を取り出す', () => {
        const { fields } = htmlSnapshot(`<head>
<title>記事の題 | k8o</title>
<meta name="description" content="記事の説明"/>
<link rel="canonical" href="https://k8o.me/blog/abs-sign"/>
<link rel="alternate" type="application/rss+xml" href="https://k8o.me/blog/feed"/>
<link rel="alternate" type="text/markdown" href="https://k8o.me/blog/abs-sign.md"/>
</head><body><svg><title>アイコン</title></svg></body>`);

        expect(fields.get('title')).toBe('記事の題 | k8o');
        expect(fields.get('meta:description')).toBe('記事の説明');
        expect(fields.get('link:canonical')).toBe(
          'https://k8o.me/blog/abs-sign',
        );
        expect(fields.get('link:alternate')).toBe(
          'application/rss+xml https://k8o.me/blog/feed\ntext/markdown https://k8o.me/blog/abs-sign.md',
        );
      });

      it('og: と twitter: の meta だけを取り出し、同じ名前は改行でつなぐ', () => {
        const { fields } = htmlSnapshot(`<head>
<meta name="application-name" content="k8o"/>
<meta property="og:image" content="https://k8o.me/a.png"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image" content="https://k8o.me/b.png"/>
<meta property="article:author" content="k8o"/>
<meta name="twitter:card" content="summary_large_image"/>
</head><body></body>`);

        expect(Object.fromEntries(fields)).toMatchObject({
          'meta:og:image': 'https://k8o.me/a.png\nhttps://k8o.me/b.png',
          'meta:og:image:width': '1200',
          'meta:twitter:card': 'summary_large_image',
        });
        expect(fields.has('meta:application-name')).toBe(false);
        expect(fields.has('meta:article:author')).toBe(false);
      });

      it('最初の og:image を返す', () => {
        const snapshot = htmlSnapshot(`<head>
<meta property="og:image" content="https://k8o.me/a.png"/>
<meta property="og:image" content="https://k8o.me/b.png"/>
</head><body></body>`);

        expect(snapshot.ogImage).toBe('https://k8o.me/a.png');
      });

      it('JSON-LD はパースして、値ごとにパスの項目にする', () => {
        const { fields } = htmlSnapshot(`<head></head><body><main>
<script type="application/ld+json">{"@type":"BlogPosting","image":"https://k8o.me/og.png","wordCount":120,"author":{"name":"k8o"},"keywords":["CSS","abs"]}</script>
<script type="application/ld+json">{"@type":"BreadcrumbList"}</script>
</main></body>`);

        expect(
          [...fields].filter(([field]) => field.startsWith('json-ld')),
        ).toStrictEqual([
          ['json-ld[0].@type', '"BlogPosting"'],
          ['json-ld[0].image', '"https://k8o.me/og.png"'],
          ['json-ld[0].wordCount', '120'],
          ['json-ld[0].author.name', '"k8o"'],
          ['json-ld[0].keywords[0]', '"CSS"'],
          ['json-ld[0].keywords[1]', '"abs"'],
          ['json-ld[1].@type', '"BreadcrumbList"'],
        ]);
      });

      it('main のテキストは script・style・template を除き、空白を詰める', () => {
        const { fields } =
          htmlSnapshot(`<head></head><body><header>ヘッダー</header><main>
<h1>見出し</h1>
<p>本文の  <b>強調</b></p>
<script type="application/ld+json">{"@type":"BlogPosting"}</script>
<style>.a{color:red}</style><template id="B:0"></template>
</main></body>`);

        expect(fields.get('main:text')).toBe('見出し 本文の 強調');
      });

      it('main の img の縦横比を並べ、width と height が揃わなければ ? にする', () => {
        const { fields } = htmlSnapshot(`<head></head><body><main>
<img width="1200" height="630" src="/a.png"/>
<img src="/b.png"/>
<img width="300" src="/c.png"/>
<img width="400" height="300" src="/d.png"/>
</main></body>`);

        expect(fields.get('main:img-ratios')).toBe('1.905 ? ? 1.333');
      });
    });

    describe('異常系', () => {
      it('JSON-LD がパースできなければ、元の文字列を項目にする', () => {
        const { fields } = htmlSnapshot(
          '<head></head><body><script type="application/ld+json">{broken</script></body>',
        );

        expect(fields.get('json-ld[0]')).toBe('{broken');
      });
    });

    describe('エッジケース', () => {
      it('main の外の img は数えない', () => {
        const { fields } = htmlSnapshot(`<head></head><body>
<img width="10" height="10" src="/outside.png"/>
<main><img width="1200" height="630" src="/a.png"/></main>
</body>`);

        expect(fields.get('main:img-ratios')).toBe('1.905');
      });
    });
  });

  describe('画像', () => {
    describe('正常系', () => {
      it('PNG は寸法を項目にし、バイト数を参考に返す', () => {
        const snapshot = takeSnapshot(
          response('image/png', pngHeader(1200, 630)),
        );

        expect(snapshot.fields.get('image:size')).toBe('1200x630');
        expect(snapshot.imageBytes).toBe(24);
      });
    });

    describe('エッジケース', () => {
      it('PNG でなければ寸法を不明にする', () => {
        const snapshot = takeSnapshot(
          response('image/avif', encode('not a png')),
        );

        expect(snapshot.fields.get('image:size')).toBe('不明');
      });

      it('画像でなければバイト数を返さない', () => {
        const snapshot = takeSnapshot(
          response('text/markdown; charset=utf-8', encode('# 見出し')),
        );

        expect(snapshot.imageBytes).toBeNull();
      });
    });
  });

  describe('テキスト', () => {
    describe('正常系', () => {
      it('status と Content-Type を項目にする', () => {
        const snapshot = takeSnapshot({
          ...response('text/plain; charset=utf-8', encode('not found')),
          status: 404,
        });

        expect(snapshot.fields.get('status')).toBe('404');
        expect(snapshot.fields.get('content-type')).toBe(
          'text/plain; charset=utf-8',
        );
      });

      it('本文をそのまま項目にする', () => {
        const snapshot = takeSnapshot(
          response(
            'application/rss+xml; charset=utf-8',
            encode('<rss><channel><title>k8o</title></channel></rss>'),
          ),
        );

        expect(snapshot.fields.get('body')).toBe(
          '<rss><channel><title>k8o</title></channel></rss>',
        );
        expect(snapshot.ogImage).toBeNull();
      });
    });

    describe('エッジケース', () => {
      it('Content-Type が無ければ空にして本文を比べる', () => {
        const snapshot = takeSnapshot(response(null, encode('body')));

        expect(snapshot.fields.get('content-type')).toBe('');
        expect(snapshot.fields.get('body')).toBe('body');
      });
    });
  });

  describe('リダイレクト', () => {
    describe('正常系', () => {
      it('Location はオリジンを外したパスにし、本文は比べない', () => {
        const snapshot = takeSnapshot({
          ...response(null, encode('http://localhost:3001/about')),
          url: 'http://localhost:3001/about/',
          status: 308,
          location: 'http://localhost:3001/about?from=a#top',
        });

        expect(Object.fromEntries(snapshot.fields)).toStrictEqual({
          status: '308',
          'content-type': '',
          location: '/about?from=a#top',
        });
      });
    });

    describe('エッジケース', () => {
      it('オリジンの無い Location もパスにする', () => {
        const snapshot = takeSnapshot({
          ...response(null, encode('')),
          url: 'http://localhost:3001/blog/abs-sign/',
          status: 308,
          location: '/blog/abs-sign',
        });

        expect(snapshot.fields.get('location')).toBe('/blog/abs-sign');
      });

      it('本番のオリジンへの Location は、別のオリジンから取ってもパスにする', () => {
        const snapshot = takeSnapshot({
          ...response(null, encode('')),
          url: 'https://main-xxx.vercel.app/reading-list/feed?utm=1',
          status: 308,
          location: 'https://k8o.me/reading-list/feed',
        });

        expect(snapshot.fields.get('location')).toBe('/reading-list/feed');
      });

      it('別のオリジンへの Location は絶対 URL のまま比べる', () => {
        const snapshot = takeSnapshot({
          ...response(null, encode('')),
          status: 307,
          location: 'https://example.com/about',
        });

        expect(snapshot.fields.get('location')).toBe(
          'https://example.com/about',
        );
      });

      it('www への Location は本番のオリジンにまとめず、絶対 URL のまま比べる', () => {
        const snapshot = takeSnapshot({
          ...response(null, encode('')),
          url: 'https://k8o.me/blog?x=1',
          status: 308,
          location: 'https://www.k8o.me/blog?x=1',
        });

        expect(snapshot.fields.get('location')).toBe(
          'https://www.k8o.me/blog?x=1',
        );
      });
    });
  });
});
