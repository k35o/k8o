import { describe, expect, it } from 'vitest';

import { diffFields, excerptPair, partitionIgnored } from './diff';

describe('diffFields', () => {
  describe('正常系', () => {
    it('値の違う項目だけを返す', () => {
      const base = new Map([
        ['status', '200'],
        ['content-type', 'text/html'],
        ['title', '旧'],
        ['meta:description', '同じ'],
      ]);
      const head = new Map([
        ['status', '200'],
        ['content-type', 'text/html'],
        ['title', '新'],
        ['meta:description', '同じ'],
      ]);

      expect(diffFields(base, head, [])).toStrictEqual([
        { field: 'title', base: '旧', head: '新' },
      ]);
    });

    it('片方にだけある項目は、無い側を null にして返す', () => {
      const base = new Map([
        ['status', '200'],
        ['content-type', 'text/html'],
        ['json-ld[0].image', '"a"'],
      ]);
      const head = new Map([
        ['status', '200'],
        ['content-type', 'text/html'],
        ['meta:og:image', 'b'],
      ]);

      expect(diffFields(base, head, [])).toStrictEqual([
        { field: 'json-ld[0].image', base: '"a"', head: null },
        { field: 'meta:og:image', base: null, head: 'b' },
      ]);
    });

    it('同じなら空にする', () => {
      const fields = new Map([
        ['status', '200'],
        ['content-type', 'text/plain'],
        ['body', 'x'],
      ]);

      expect(diffFields(fields, new Map(fields), [])).toStrictEqual([]);
    });
  });

  describe('エッジケース', () => {
    it('status か Content-Type が違えば、ほかの項目は比べない', () => {
      const base = new Map([
        ['status', '200'],
        ['content-type', 'text/html'],
        ['title', '記事'],
      ]);
      const head = new Map([
        ['status', '404'],
        ['content-type', 'text/html'],
        ['title', '見つかりません'],
      ]);

      expect(diffFields(base, head, [])).toStrictEqual([
        { field: 'status', base: '200', head: '404' },
      ]);
    });

    it('Content-Type の差が無視に合えば、ほかの項目も比べる', () => {
      const ignore = [/^content-type$/u];
      const base = new Map([
        ['status', '200'],
        ['content-type', 'text/plain'],
        ['body', 'User-Agent: *\nAllow: /\n'],
      ]);
      const head = new Map([
        ['status', '200'],
        ['content-type', 'text/plain; charset=utf-8'],
        ['body', 'User-Agent: *\nDisallow: /\n'],
      ]);

      expect(
        partitionIgnored(diffFields(base, head, ignore), ignore),
      ).toStrictEqual({
        reported: [
          {
            field: 'body',
            base: 'User-Agent: *\nAllow: /\n',
            head: 'User-Agent: *\nDisallow: /\n',
          },
        ],
        ignored: [
          {
            field: 'content-type',
            base: 'text/plain',
            head: 'text/plain; charset=utf-8',
          },
        ],
      });
    });
  });
});

describe('partitionIgnored', () => {
  describe('正常系', () => {
    it('項目の名前が正規表現に合う差分を無視に分ける', () => {
      const diffs = [
        { field: 'meta:og:image', base: 'a', head: 'b' },
        { field: 'meta:og:image:width', base: '1', head: '2' },
        { field: 'json-ld[0].image', base: 'a', head: 'b' },
        { field: 'title', base: 'a', head: 'b' },
      ];

      expect(
        partitionIgnored(diffs, [
          /^meta:og:image/u,
          /^json-ld\[\d+\]\.image$/u,
        ]),
      ).toStrictEqual({
        reported: [{ field: 'title', base: 'a', head: 'b' }],
        ignored: diffs.slice(0, 3),
      });
    });
  });

  describe('エッジケース', () => {
    it('指定が無ければすべてを報告に回す', () => {
      const diffs = [{ field: 'title', base: 'a', head: 'b' }];

      expect(partitionIgnored(diffs, [])).toStrictEqual({
        reported: diffs,
        ignored: [],
      });
    });
  });
});

describe('excerptPair', () => {
  describe('正常系', () => {
    it('短い1行の値はそのまま返す', () => {
      expect(excerptPair('旧の題', '新の題')).toStrictEqual({
        base: '旧の題',
        head: '新の題',
      });
    });

    it('長い値は最初に違う位置の前後だけを、行の番号と一緒に返す', () => {
      const same = 'あ'.repeat(100);
      const base = `1行目\n${same}旧${same}`;
      const head = `1行目\n${same}新${same}`;

      expect(excerptPair(base, head)).toStrictEqual({
        base: `2行目: …${'あ'.repeat(40)}旧${'あ'.repeat(40)}…`,
        head: `2行目: …${'あ'.repeat(40)}新${'あ'.repeat(40)}…`,
      });
    });
  });

  describe('エッジケース', () => {
    it('違う位置が行の先頭に近ければ、行の頭から返す', () => {
      const tail = 'い'.repeat(100);

      expect(
        excerptPair(`見出し\n旧${tail}`, `見出し\n新${tail}`),
      ).toStrictEqual({
        base: `2行目: 旧${'い'.repeat(40)}…`,
        head: `2行目: 新${'い'.repeat(40)}…`,
      });
    });

    it('片方が無く、もう片方が短い1行なら、無い側を (無し) にしてそのまま返す', () => {
      expect(excerptPair(null, '新の題')).toStrictEqual({
        base: '(無し)',
        head: '新の題',
      });
    });

    it('片方が無く、もう片方が長い複数行なら、1行目の頭と全体の大きさだけを返す', () => {
      expect(
        excerptPair(`# 404 Not Found\n\n${'あ'.repeat(200)}\n`, null),
      ).toStrictEqual({
        base: '1行目: # 404 Not Found（全3行・218字）',
        head: '(無し)',
      });
    });
  });
});
