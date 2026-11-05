import { describe, expect, it } from 'vitest';

import { articleMarkdownHref } from '@/components/blog/blog-layout/article-markdown-href';

import { BEFORE_NOT_FOUND, beforeFiles } from './vercel-routes';

const BEFORE_FILES = beforeFiles('production');

const sources = [...BEFORE_FILES, ...BEFORE_NOT_FOUND].map(({ src }) => src);

type Answer =
  | { readonly status: number; readonly location: string }
  | { readonly status: number; readonly file: string };

// Vercel が filesystem より前の規則を当てる順にたどり、最初に止まった規則の答えを返す。
// 止まらなければ、その URL の名前のファイルを探しに行く。check の書き換えは行き先のファイルがある場合を見る
const answerOf = (path: string, accept = 'text/html'): Answer => {
  for (const route of BEFORE_FILES) {
    const match = new RegExp(route.src, route.caseSensitive ? 'u' : 'iu').exec(
      path,
    );
    if (match === null || route.continue === true) continue;
    const accepted = (route.has ?? []).every(
      ({ key, value = '' }) =>
        key === 'accept' && new RegExp(value, 'u').test(accept),
    );
    if (!accepted) continue;
    const fill = (template: string): string =>
      template.replaceAll(/\$(\d)/gu, (_, n: string) => match[Number(n)] ?? '');
    const location = route.headers?.['Location'];
    if (location !== undefined) {
      return { status: route.status ?? 200, location: fill(location) };
    }
    if (route.dest !== undefined) {
      return { status: route.status ?? 200, file: fill(route.dest) };
    }
  }
  return { status: 200, file: path };
};

describe('vercel() の規則', () => {
  describe('正常系', () => {
    it.each(sources)(
      '%s は、Vercel が当てるパスの全体を ^ から $ まで書く',
      (src) => {
        expect(src).toMatch(/^\^\/.*\$$/u);
      },
    );

    it.each([
      ['/index.html', '/'],
      ['/about/index.html', '/about'],
      ['/blog/index.html', '/blog'],
      ['/blog/abs-sign/index.html', '/blog/abs-sign'],
    ])('%s は、ページの URL の %s へ 308 で送る', (path, location) => {
      expect(answerOf(path)).toStrictEqual({ status: 308, location });
    });

    it.each([
      ['/about/', '/about'],
      ['/blog/abs-sign/', '/blog/abs-sign'],
      ['/ブログ/', '/ブログ'],
      ['/ブログ/index.html', '/ブログ'],
    ])(
      '%s は、末尾のスラッシュと index.html を外した %s へ 308 で送る',
      (path, location) => {
        expect(answerOf(path)).toStrictEqual({ status: 308, location });
      },
    );

    it('404.html を名前で開くと、404 で答える', () => {
      expect(answerOf('/404.html')).toStrictEqual({
        status: 404,
        file: '/404.html',
      });
    });

    it.each(['/index.md', '/not-found.md'])(
      '%s を名前で開くと、markdown の 404 で答える',
      (path) => {
        expect(answerOf(path)).toStrictEqual({
          status: 404,
          file: '/not-found.md',
        });
      },
    );

    it('記事の「Markdownをコピー」が取る URL は、記事の markdown を 200 で返す', () => {
      expect(answerOf(articleMarkdownHref('abs-sign'), '*/*')).toStrictEqual({
        status: 200,
        file: '/blog/abs-sign/article.md',
      });
    });

    it('記事の .md の URL は、記事の markdown に書き換える', () => {
      expect(answerOf('/blog/abs-sign.md')).toStrictEqual({
        status: 200,
        file: '/blog/abs-sign/article.md',
      });
    });

    it('markdown を求める記事の URL は、記事の markdown に書き換える', () => {
      expect(answerOf('/blog/abs-sign', 'text/markdown')).toStrictEqual({
        status: 200,
        file: '/blog/abs-sign/article.md',
      });
    });

    it('markdown を求める / は、トップの markdown に書き換える', () => {
      expect(answerOf('/', 'text/markdown')).toStrictEqual({
        status: 200,
        file: '/index.md',
      });
    });

    it.each(['/index.rsc', '/blog/index.rsc', '/blog/abs-sign/index.rsc'])(
      'router が読む %s は、そのままファイルを探す',
      (path) => {
        expect(answerOf(path)).toStrictEqual({ status: 200, file: path });
      },
    );
  });

  describe('エッジケース', () => {
    // 空の区間を許すと、//evil.test/index.html から Location: //evil.test を作ってしまう
    it.each([
      '//evil.test/index.html',
      '///evil.test/index.html',
      '//evil.test/',
      '/blog//index.html',
    ])('空の区間を含む %s は、転送せずにファイルを探す', (path) => {
      expect(answerOf(path)).toStrictEqual({ status: 200, file: path });
    });

    // Vercel がデコードしたパスに当てるときの形。区間の「\」やタブを許すと Location: /\evil.test や
    // /<TAB>/evil.test を作り、ブラウザはどちらも //evil.test と読む
    it.each([
      '/\\evil.test/index.html',
      '/\t/evil.test/index.html',
      '/\\evil.test/',
      '/\n/evil.test/',
    ])(
      '「\\」か制御文字の区間を含む %j は、転送せずにファイルを探す',
      (path) => {
        expect(answerOf(path)).toStrictEqual({ status: 200, file: path });
      },
    );

    // Vercel が生のパスに当てるときの形。ブラウザは Location の %5C や %09 を戻さないので、
    // 同じオリジンのパスになる
    it.each([
      ['/%5Cevil.test/index.html', '/%5Cevil.test'],
      ['/%09/evil.test/', '/%09/evil.test'],
    ])(
      'エンコードした %s は、同じオリジンの %s へ 308 で送る',
      (path, location) => {
        expect(answerOf(path)).toStrictEqual({ status: 308, location });
        expect(new URL(location, 'https://k8o.me/').origin).toBe(
          'https://k8o.me',
        );
      },
    );
  });
});
