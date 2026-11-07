import { describe, expect, it } from 'vitest';

import { readingListState, readSourceIds } from './search-params';

const read = (search: string) => {
  const url = readingListState.parseUrl(new URLSearchParams(search));
  return { q: url.q, source: readSourceIds(url.source), sort: url.sort };
};

const rewrite = (search: string): string =>
  readingListState.search(
    readingListState.parseUrl(new URLSearchParams(search)),
  );

describe('readingListState の URL の読み（nuqs と同じ）', () => {
  describe('正常系', () => {
    it.each([
      ['', { q: '', source: [], sort: 'newest' }],
      ['?q=react', { q: 'react', source: [], sort: 'newest' }],
      ['?q=React%20Router', { q: 'React Router', source: [], sort: 'newest' }],
      ['?q=%E3%81%82', { q: 'あ', source: [], sort: 'newest' }],
      ['?source=1', { q: '', source: [1], sort: 'newest' }],
      ['?source=1,2', { q: '', source: [1, 2], sort: 'newest' }],
      ['?source=1%2C2', { q: '', source: [1, 2], sort: 'newest' }],
      ['?source=2,1', { q: '', source: [2, 1], sort: 'newest' }],
      ['?sort=oldest', { q: '', source: [], sort: 'oldest' }],
      ['?sort=newest', { q: '', source: [], sort: 'newest' }],
      [
        '?q=css&source=1,2&sort=oldest',
        { q: 'css', source: [1, 2], sort: 'oldest' },
      ],
      ['?zz=1&q=css', { q: 'css', source: [], sort: 'newest' }],
    ])('%j を読む', (search, expected) => {
      expect(read(search)).toStrictEqual(expected);
    });
  });

  describe('異常系', () => {
    it.each([
      ['?source=abc', { q: '', source: [], sort: 'newest' }],
      ['?source=1,abc,2', { q: '', source: [1, 2], sort: 'newest' }],
      ['?source=,', { q: '', source: [], sort: 'newest' }],
      ['?sort=OLDEST', { q: '', source: [], sort: 'newest' }],
      ['?sort=foo', { q: '', source: [], sort: 'newest' }],
      ['?Q=css', { q: '', source: [], sort: 'newest' }],
    ])('%j は読めない値を既定か空にする', (search, expected) => {
      expect(read(search)).toStrictEqual(expected);
    });
  });

  describe('エッジケース', () => {
    it.each([
      ['?q=', { q: '', source: [], sort: 'newest' }],
      ['?q=a&q=b', { q: 'a', source: [], sort: 'newest' }],
      ['?source=1,1', { q: '', source: [1, 1], sort: 'newest' }],
      ['?source=', { q: '', source: [], sort: 'newest' }],
      ['?source=1.9', { q: '', source: [1], sort: 'newest' }],
      ['?source=-1', { q: '', source: [-1], sort: 'newest' }],
      ['?source=0x10', { q: '', source: [16], sort: 'newest' }],
      ['?source=1e2', { q: '', source: [1], sort: 'newest' }],
      ['?source=%201', { q: '', source: [1], sort: 'newest' }],
      ['?source=999', { q: '', source: [999], sort: 'newest' }],
      ['?source=1&source=2', { q: '', source: [1], sort: 'newest' }],
      ['?source=1,', { q: '', source: [1], sort: 'newest' }],
      ['?sort=', { q: '', source: [], sort: 'newest' }],
      ['?sort=oldest&sort=newest', { q: '', source: [], sort: 'oldest' }],
    ])('%j を読む', (search, expected) => {
      expect(read(search)).toStrictEqual(expected);
    });
  });
});

describe('readingListState の URL の書き', () => {
  describe('正常系', () => {
    it.each([
      [{ q: 'css' }, 'q=css'],
      [{ source: '1,2' }, 'source=1%2C2'],
      [{ sort: 'oldest' }, 'sort=oldest'],
      [{ sort: 'oldest', source: '1', q: 'x' }, 'q=x&source=1&sort=oldest'],
    ] as const)('%j を %j と書く', (values, expected) => {
      expect(readingListState.search(values)).toBe(expected);
    });

    it('既定の値は書かない', () => {
      expect(
        readingListState.search({ q: '', source: '', sort: 'newest' }),
      ).toBe('');
    });
  });

  describe('エッジケース', () => {
    it('読めない source は文字列のまま書き、表に無い sort は既定に読んで書かない', () => {
      expect(rewrite('?source=1,abc&sort=foo')).toBe('source=1%2Cabc');
    });

    it('同じキーが複数あれば最初の値だけを書く', () => {
      expect(rewrite('?q=a&q=b&source=1&source=16')).toBe('q=a&source=1');
    });
  });
});
