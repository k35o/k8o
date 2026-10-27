import { describe, expect, it } from 'vitest';

import { applyAllowances, selectAllowances } from './allowances';
import type { Target } from './targets';

const get = (path: string): Target => ({
  label: path,
  path,
  accept: null,
  method: 'GET',
  checksCdnCache: false,
});

const markdown = (path: string): Target => ({
  ...get(path),
  label: `${path} (Accept: text/markdown)`,
  accept: 'text/markdown',
});

const allow = (
  name: string,
  fields: Record<string, string>,
  target: Target = get('/'),
  headUrl = `http://localhost:3001${target.path}`,
): Record<string, string> =>
  Object.fromEntries(
    applyAllowances(new Map(Object.entries(fields)), target, headUrl, [
      ...selectAllowances([name]),
    ]),
  );

describe('selectAllowances', () => {
  describe('異常系', () => {
    it('知らない名前なら、知っている名前を並べて止める', () => {
      expect(() => selectAllowances(['og-png', 'typo'])).toThrowError(
        '--allow typo は無い。使える名前: og-png, vary-next, md-static, og-acao',
      );
    });
  });
});

describe('applyAllowances', () => {
  describe('og-png', () => {
    describe('正常系', () => {
      it('og:image と twitter:image の opengraph-image を og.png にする', () => {
        expect(
          allow('og-png', {
            'meta:og:image': 'https://k8o.me/opengraph-image?778bf7fefda46d0e',
            'meta:twitter:image':
              'https://k8o.me/blog/opengraph-image?0b3bf435a1b2c3d4',
          }),
        ).toStrictEqual({
          'meta:og:image': 'https://k8o.me/og.png',
          'meta:twitter:image': 'https://k8o.me/blog/og.png',
        });
      });

      it('ルートグループの下で付く opengraph-image の接尾辞も外す', () => {
        expect(
          allow('og-png', {
            'meta:og:image':
              'https://k8o.me/slides/sample-deck/opengraph-image-1u3k9f?9f0b089abad57d27',
          }),
        ).toStrictEqual({
          'meta:og:image': 'https://k8o.me/slides/sample-deck/og.png',
        });
      });

      it('JSON-LD の image も書き換える', () => {
        expect(
          allow('og-png', {
            'json-ld[0].image': '"https://k8o.me/talks/opengraph-image?a1b2"',
            'json-ld[1].image[0]': '"https://k8o.me/opengraph-image?a1b2"',
          }),
        ).toStrictEqual({
          'json-ld[0].image': '"https://k8o.me/talks/og.png"',
          'json-ld[1].image[0]': '"https://k8o.me/og.png"',
        });
      });

      it('改行でつないだ複数の og:image をそれぞれ書き換える', () => {
        expect(
          allow('og-png', {
            'meta:og:image':
              'https://k8o.me/opengraph-image?a1b2\nhttps://k8o.me/blog/abs-sign/og.png',
          }),
        ).toStrictEqual({
          'meta:og:image':
            'https://k8o.me/og.png\nhttps://k8o.me/blog/abs-sign/og.png',
        });
      });
    });

    describe('エッジケース', () => {
      it('画像の URL ではない項目は書き換えない', () => {
        const fields = {
          'meta:og:url': 'https://k8o.me/opengraph-image',
          'meta:og:image:alt': 'opengraph-image',
          'main:text': '/opengraph-image?a1b2 を開く',
        };

        expect(allow('og-png', fields)).toStrictEqual(fields);
      });
    });
  });

  describe('vary-next', () => {
    describe('正常系', () => {
      it('Next の語を除き、残りを元の順に並べる', () => {
        expect(
          allow('vary-next', {
            'header:vary':
              'rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch, Accept',
          }),
        ).toStrictEqual({ 'header:vary': 'Accept' });
      });

      it('大文字の Next の語と Next-Url も除く', () => {
        expect(
          allow('vary-next', {
            'header:vary':
              'RSC, Next-Router-State-Tree, Next-Url, Accept-Encoding',
          }),
        ).toStrictEqual({ 'header:vary': 'Accept-Encoding' });
      });

      it('Next の語しか無ければ、Vary が無いものとして扱う', () => {
        expect(
          allow('vary-next', {
            status: '200',
            'header:vary':
              'rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch',
          }),
        ).toStrictEqual({ status: '200' });
      });
    });

    describe('エッジケース', () => {
      it('Vary が無ければ何もしない', () => {
        expect(allow('vary-next', { status: '200' })).toStrictEqual({
          status: '200',
        });
      });
    });
  });

  describe('md-static', () => {
    const functionMarkdown = {
      status: '200',
      'content-type': 'text/markdown; charset=utf-8',
      'header:cache-control': 'public',
    };
    const staticMarkdown = {
      status: '200',
      'content-type': 'text/markdown; charset=utf-8',
      'header:cache-control': 'public, max-age=0, must-revalidate',
      'header:access-control-allow-origin': '*',
    };

    describe('正常系', () => {
      it('記事の .md は、静的なファイルの Cache-Control と ACAO にする', () => {
        expect(
          allow('md-static', functionMarkdown, get('/blog/abs-sign.md')),
        ).toStrictEqual(staticMarkdown);
      });

      it('記事への Accept: text/markdown と、.md への HEAD にも当てる', () => {
        expect(
          allow('md-static', functionMarkdown, markdown('/blog/abs-sign')),
        ).toStrictEqual(staticMarkdown);
        expect(
          allow('md-static', functionMarkdown, {
            ...get('/blog/abs-sign.md'),
            method: 'HEAD',
          }),
        ).toStrictEqual(staticMarkdown);
      });
    });

    describe('エッジケース', () => {
      it('404 の markdown には当てない', () => {
        const fields = { ...functionMarkdown, status: '404' };

        expect(
          allow('md-static', fields, get('/blog/compare-sites-not-found.md')),
        ).toStrictEqual(fields);
      });

      it('記事でないパスと、markdown でない応答には当てない', () => {
        const feed = {
          ...functionMarkdown,
          'content-type': 'application/rss+xml; charset=utf-8',
        };

        expect(
          allow('md-static', functionMarkdown, markdown('/')),
        ).toStrictEqual(functionMarkdown);
        expect(allow('md-static', feed, markdown('/blog/feed'))).toStrictEqual(
          feed,
        );
      });

      it('観測した値と違う Cache-Control と、すでにある ACAO は書き換えない', () => {
        const fields = {
          ...functionMarkdown,
          'header:cache-control': 'public, s-maxage=300',
          'header:access-control-allow-origin': 'https://k8o.me',
        };

        expect(
          allow('md-static', fields, get('/blog/abs-sign.md')),
        ).toStrictEqual(fields);
      });
    });
  });

  describe('og-acao', () => {
    const functionPng = {
      status: '200',
      'content-type': 'image/png',
      'header:cache-control': 'public, max-age=0, must-revalidate',
    };

    describe('正常系', () => {
      it('head が静的な og.png を返す og:image は、base に ACAO: * を足す', () => {
        expect(
          allow(
            'og-acao',
            functionPng,
            get('/playgrounds/alpha-function/opengraph-image'),
            'http://localhost:3001/playgrounds/alpha-function/og.png',
          ),
        ).toStrictEqual({
          ...functionPng,
          'header:access-control-allow-origin': '*',
        });
      });

      it('直接比べる記事の og.png にも当てる', () => {
        expect(
          allow('og-acao', functionPng, get('/blog/abs-sign/og.png')),
        ).toStrictEqual({
          ...functionPng,
          'header:access-control-allow-origin': '*',
        });
      });
    });

    describe('エッジケース', () => {
      it('head のパスが /og.png で終わらなければ当てない', () => {
        expect(
          allow(
            'og-acao',
            functionPng,
            get('/playgrounds/alpha-function/opengraph-image'),
            'https://k8o.me/playgrounds/alpha-function/opengraph-image?8950e7b40cbfeadb',
          ),
        ).toStrictEqual(functionPng);
      });

      it('すでにある ACAO は書き換えない', () => {
        const fields = {
          ...functionPng,
          'header:access-control-allow-origin': 'https://k8o.me',
        };

        expect(
          allow('og-acao', fields, get('/blog/abs-sign/og.png')),
        ).toStrictEqual(fields);
      });

      it('PNG でない応答には当てない', () => {
        const notFound = {
          status: '404',
          'content-type': 'text/html; charset=utf-8',
        };

        expect(
          allow(
            'og-acao',
            notFound,
            get('/blog/compare-sites-not-found/og.png'),
          ),
        ).toStrictEqual(notFound);
      });
    });
  });

  describe('組み合わせ', () => {
    describe('正常系', () => {
      it('選んだ順にすべての書き換えを当てる', () => {
        expect(
          Object.fromEntries(
            applyAllowances(
              new Map([
                ['meta:og:image', 'https://k8o.me/opengraph-image?a1b2'],
                ['header:vary', 'rsc, Accept'],
              ]),
              get('/'),
              'http://localhost:3001/',
              selectAllowances(['og-png', 'vary-next']),
            ),
          ),
        ).toStrictEqual({
          'meta:og:image': 'https://k8o.me/og.png',
          'header:vary': 'Accept',
        });
      });
    });

    describe('エッジケース', () => {
      it('何も選ばなければ元の項目のまま返す', () => {
        const fields = new Map([['header:vary', 'rsc']]);

        expect(
          applyAllowances(fields, get('/'), 'http://localhost:3001/', []),
        ).toStrictEqual(fields);
      });
    });
  });
});
