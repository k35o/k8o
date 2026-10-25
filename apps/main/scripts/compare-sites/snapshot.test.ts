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
  headers: new Headers(
    contentType === null ? {} : { 'content-type': contentType },
  ),
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
      it('title・html の lang・canonical・alternate を取り出す', () => {
        const { fields } = htmlSnapshot(`<head>
<title>記事の題 | k8o</title>
<link rel="canonical" href="https://k8o.me/blog/abs-sign"/>
<link rel="alternate" type="application/rss+xml" href="https://k8o.me/blog/feed"/>
<link rel="alternate" type="text/markdown" href="https://k8o.me/blog/abs-sign.md"/>
</head><body><svg><title>アイコン</title></svg></body>`);

        expect(fields.get('title')).toBe('記事の題 | k8o');
        expect(fields.get('html:lang')).toBe('ja');
        expect(fields.get('link:canonical')).toBe(
          'https://k8o.me/blog/abs-sign',
        );
        expect(fields.get('link:alternate')).toBe(
          'https://k8o.me/blog/feed type=application/rss+xml\nhttps://k8o.me/blog/abs-sign.md type=text/markdown',
        );
      });

      it('head の meta は name か property を名前にして取り出し、同じ名前は改行でつなぐ', () => {
        const { fields } = htmlSnapshot(`<head>
<meta charSet="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex"/>
<meta name="description" content="記事の説明"/>
<meta name="application-name" content="k8o"/>
<meta property="og:image" content="https://k8o.me/a.png"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image" content="https://k8o.me/b.png"/>
<meta property="article:author" content="k8o"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta http-equiv="Content-Security-Policy" content="default-src 'self'"/>
</head><body></body>`);

        expect(
          Object.fromEntries(
            [...fields].filter(([field]) => field.startsWith('meta:')),
          ),
        ).toStrictEqual({
          'meta:charset': 'utf-8',
          'meta:viewport': 'width=device-width, initial-scale=1',
          'meta:robots': 'noindex',
          'meta:description': '記事の説明',
          'meta:application-name': 'k8o',
          'meta:og:image': 'https://k8o.me/a.png\nhttps://k8o.me/b.png',
          'meta:og:image:width': '1200',
          'meta:article:author': 'k8o',
          'meta:twitter:card': 'summary_large_image',
          'meta:http-equiv:content-security-policy': "default-src 'self'",
        });
      });

      it('generator と next-size-adjust の meta は取り出さない', () => {
        const { fields } = htmlSnapshot(`<head>
<meta name="generator" content="Next.js"/>
<meta name="next-size-adjust" content=""/>
</head><body></body>`);

        expect(
          [...fields.keys()].filter((field) => field.startsWith('meta:')),
        ).toStrictEqual([]);
      });

      it('manifest・icon・apple-touch-icon の link を取り出し、icon の query は外す', () => {
        const { fields } = htmlSnapshot(`<head>
<link rel="manifest" href="/manifest.webmanifest"/>
<link rel="icon" href="/favicon.ico?favicon.421_ywfw-fh2p.ico" sizes="48x48" type="image/x-icon"/>
<link rel="icon" href="/icon.png?icon.3kok6mrb82kh7.png" sizes="180x180" type="image/png"/>
<link rel="apple-touch-icon" href="/apple-icon.png?apple-icon.3kok6mrb82kh7.png" sizes="180x180" type="image/png"/>
<link rel="stylesheet" href="/_next/static/chunks/a.css"/>
<link rel="preload" href="/_next/static/media/a.woff2" as="font"/>
</head><body></body>`);

        expect(
          Object.fromEntries(
            [...fields].filter(([field]) => field.startsWith('link:')),
          ),
        ).toStrictEqual({
          'link:manifest': '/manifest.webmanifest',
          'link:icon':
            '/favicon.ico sizes=48x48 type=image/x-icon\n/icon.png sizes=180x180 type=image/png',
          'link:apple-touch-icon':
            '/apple-icon.png sizes=180x180 type=image/png',
        });
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
      it('rel に複数の語があれば、それぞれの語の項目にする', () => {
        const { fields } = htmlSnapshot(`<head>
<link rel="shortcut icon" href="/favicon.ico?v=1"/>
</head><body></body>`);

        expect(fields.get('link:icon')).toBe('/favicon.ico');
      });

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

  describe('ヘッダー', () => {
    describe('正常系', () => {
      it('セキュリティ・キャッシュ・CORS・Vary のヘッダーを項目にし、ほかは取らない', () => {
        const snapshot = takeSnapshot({
          ...response('text/html; charset=utf-8', encode('<html></html>')),
          headers: new Headers({
            'content-type': 'text/html; charset=utf-8',
            'content-security-policy': "default-src 'self'",
            'content-security-policy-report-only':
              "require-trusted-types-for 'script'",
            'reporting-endpoints':
              'csp-endpoint="https://api.k8o.me/public/reports"',
            'x-content-type-options': 'nosniff',
            'permissions-policy': 'camera=()',
            vary: 'rsc, Accept',
            'cache-control': 'public, max-age=0, must-revalidate',
            'access-control-allow-origin': '*',
            date: 'Sun, 25 Oct 2026 02:34:04 GMT',
            'x-vercel-id': 'hnd1::abc',
            'x-vercel-cache': 'HIT',
          }),
        });

        expect(
          Object.fromEntries(
            [...snapshot.fields].filter(([field]) =>
              field.startsWith('header:'),
            ),
          ),
        ).toStrictEqual({
          'header:content-security-policy': "default-src 'self'",
          'header:content-security-policy-report-only':
            "require-trusted-types-for 'script'",
          'header:reporting-endpoints':
            'csp-endpoint="https://api.k8o.me/public/reports"',
          'header:x-content-type-options': 'nosniff',
          'header:permissions-policy': 'camera=()',
          'header:vary': 'rsc, Accept',
          'header:cache-control': 'public, max-age=0, must-revalidate',
          'header:access-control-allow-origin': '*',
        });
      });

      it('指定したヘッダーも項目にする', () => {
        const snapshot = takeSnapshot(
          {
            ...response('application/rss+xml', encode('<rss></rss>')),
            headers: new Headers({
              'content-type': 'application/rss+xml',
              'x-vercel-cache': 'HIT',
            }),
          },
          ['x-vercel-cache'],
        );

        expect(snapshot.fields.get('header:x-vercel-cache')).toBe('HIT');
      });
    });

    describe('エッジケース', () => {
      it('同じ名前のヘッダーが2つあれば、カンマでつないだ1つの値にする', () => {
        const headers = new Headers({ 'content-type': 'text/markdown' });
        headers.append('vary', 'rsc, next-router-state-tree');
        headers.append('vary', 'Accept');

        const snapshot = takeSnapshot({
          ...response('text/markdown', encode('# 見出し')),
          headers,
        });

        expect(snapshot.fields.get('header:vary')).toBe(
          'rsc, next-router-state-tree, Accept',
        );
      });

      it('無いヘッダーは項目にしない', () => {
        const snapshot = takeSnapshot(response('text/plain', encode('body')), [
          'x-vercel-cache',
        ]);

        expect(
          [...snapshot.fields.keys()].filter((field) =>
            field.startsWith('header:'),
          ),
        ).toStrictEqual([]);
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
          headers: new Headers({
            location: 'http://localhost:3001/about?from=a#top',
          }),
        });

        expect(Object.fromEntries(snapshot.fields)).toStrictEqual({
          status: '308',
          'content-type': '',
          location: '/about?from=a#top',
        });
      });
    });

    describe('エッジケース', () => {
      it('リダイレクトでもヘッダーを項目にする', () => {
        const snapshot = takeSnapshot({
          ...response(null, encode('')),
          url: 'http://localhost:3001/about/',
          status: 308,
          headers: new Headers({
            location: '/about',
            'content-security-policy': "default-src 'self'",
          }),
        });

        expect(snapshot.fields.get('header:content-security-policy')).toBe(
          "default-src 'self'",
        );
      });

      it('オリジンの無い Location もパスにする', () => {
        const snapshot = takeSnapshot({
          ...response(null, encode('')),
          url: 'http://localhost:3001/blog/abs-sign/',
          status: 308,
          headers: new Headers({ location: '/blog/abs-sign' }),
        });

        expect(snapshot.fields.get('location')).toBe('/blog/abs-sign');
      });

      it('本番のオリジンへの Location は、別のオリジンから取ってもパスにする', () => {
        const snapshot = takeSnapshot({
          ...response(null, encode('')),
          url: 'https://main-xxx.vercel.app/reading-list/feed?utm=1',
          status: 308,
          headers: new Headers({
            location: 'https://k8o.me/reading-list/feed',
          }),
        });

        expect(snapshot.fields.get('location')).toBe('/reading-list/feed');
      });

      it('別のオリジンへの Location は絶対 URL のまま比べる', () => {
        const snapshot = takeSnapshot({
          ...response(null, encode('')),
          status: 307,
          headers: new Headers({ location: 'https://example.com/about' }),
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
          headers: new Headers({ location: 'https://www.k8o.me/blog?x=1' }),
        });

        expect(snapshot.fields.get('location')).toBe(
          'https://www.k8o.me/blog?x=1',
        );
      });
    });
  });
});
