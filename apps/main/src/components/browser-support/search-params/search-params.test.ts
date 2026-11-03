import { describe, expect, it } from 'vitest';

import { browserSupportListState, readFlag, readYear } from './search-params';

const YEARS = ['2026', '2025', '2024'];

const read = (search: string) => {
  const url = browserSupportListState.parseUrl(new URLSearchParams(search));
  return {
    q: url.q,
    widely: readFlag(url.widely),
    newly: readFlag(url.newly),
    limited: readFlag(url.limited),
    recent: readFlag(url.recent),
    year: readYear(url.year, YEARS, '2026'),
  };
};

const rewrite = (search: string): string =>
  browserSupportListState.search(
    browserSupportListState.parseUrl(new URLSearchParams(search)),
  );

describe('browserSupportListState の URL の読み（apps/main の nuqs と同じ）', () => {
  describe('正常系', () => {
    it.each([
      [
        '',
        {
          q: '',
          widely: true,
          newly: true,
          limited: true,
          recent: false,
          year: '2026',
        },
      ],
      [
        '?q=view',
        {
          q: 'view',
          widely: true,
          newly: true,
          limited: true,
          recent: false,
          year: '2026',
        },
      ],
      [
        '?widely=false',
        {
          q: '',
          widely: false,
          newly: true,
          limited: true,
          recent: false,
          year: '2026',
        },
      ],
      [
        '?widely=true',
        {
          q: '',
          widely: true,
          newly: true,
          limited: true,
          recent: false,
          year: '2026',
        },
      ],
      [
        '?newly=false',
        {
          q: '',
          widely: true,
          newly: false,
          limited: true,
          recent: false,
          year: '2026',
        },
      ],
      [
        '?limited=false',
        {
          q: '',
          widely: true,
          newly: true,
          limited: false,
          recent: false,
          year: '2026',
        },
      ],
      [
        '?recent=true',
        {
          q: '',
          widely: true,
          newly: true,
          limited: true,
          recent: true,
          year: '2026',
        },
      ],
      [
        '?year=2024',
        {
          q: '',
          widely: true,
          newly: true,
          limited: true,
          recent: false,
          year: '2024',
        },
      ],
      [
        '?year=2026',
        {
          q: '',
          widely: true,
          newly: true,
          limited: true,
          recent: false,
          year: '2026',
        },
      ],
      [
        '?q=view&widely=false&recent=true&year=2024',
        {
          q: 'view',
          widely: false,
          newly: true,
          limited: true,
          recent: true,
          year: '2024',
        },
      ],
      [
        '?zz=1&year=2025',
        {
          q: '',
          widely: true,
          newly: true,
          limited: true,
          recent: false,
          year: '2025',
        },
      ],
    ])('%j を読む', (search, expected) => {
      expect(read(search)).toStrictEqual(expected);
    });
  });

  describe('異常系', () => {
    it.each([
      [
        '?widely=abc',
        {
          q: '',
          widely: false,
          newly: true,
          limited: true,
          recent: false,
          year: '2026',
        },
      ],
      [
        '?widely=1',
        {
          q: '',
          widely: false,
          newly: true,
          limited: true,
          recent: false,
          year: '2026',
        },
      ],
      [
        '?widely=yes',
        {
          q: '',
          widely: false,
          newly: true,
          limited: true,
          recent: false,
          year: '2026',
        },
      ],
      [
        '?widely=no',
        {
          q: '',
          widely: false,
          newly: true,
          limited: true,
          recent: false,
          year: '2026',
        },
      ],
      [
        '?widely=0',
        {
          q: '',
          widely: false,
          newly: true,
          limited: true,
          recent: false,
          year: '2026',
        },
      ],
      [
        '?limited=off',
        {
          q: '',
          widely: true,
          newly: true,
          limited: false,
          recent: false,
          year: '2026',
        },
      ],
      [
        '?recent=1',
        {
          q: '',
          widely: true,
          newly: true,
          limited: true,
          recent: false,
          year: '2026',
        },
      ],
      [
        '?recent=yes',
        {
          q: '',
          widely: true,
          newly: true,
          limited: true,
          recent: false,
          year: '2026',
        },
      ],
      [
        '?recent=on',
        {
          q: '',
          widely: true,
          newly: true,
          limited: true,
          recent: false,
          year: '2026',
        },
      ],
      [
        '?year=1999',
        {
          q: '',
          widely: true,
          newly: true,
          limited: true,
          recent: false,
          year: '2026',
        },
      ],
      [
        '?year=abc',
        {
          q: '',
          widely: true,
          newly: true,
          limited: true,
          recent: false,
          year: '2026',
        },
      ],
    ])(
      '%j は true のほかを偽に、一覧に無い年を最新の年に読む',
      (search, expected) => {
        expect(read(search)).toStrictEqual(expected);
      },
    );
  });

  describe('エッジケース', () => {
    it.each([
      [
        '?q=',
        {
          q: '',
          widely: true,
          newly: true,
          limited: true,
          recent: false,
          year: '2026',
        },
      ],
      [
        '?q=a&q=b',
        {
          q: 'a',
          widely: true,
          newly: true,
          limited: true,
          recent: false,
          year: '2026',
        },
      ],
      [
        '?widely=False',
        {
          q: '',
          widely: false,
          newly: true,
          limited: true,
          recent: false,
          year: '2026',
        },
      ],
      [
        '?widely=TRUE',
        {
          q: '',
          widely: true,
          newly: true,
          limited: true,
          recent: false,
          year: '2026',
        },
      ],
      [
        '?widely=',
        {
          q: '',
          widely: false,
          newly: true,
          limited: true,
          recent: false,
          year: '2026',
        },
      ],
      [
        '?widely=false&widely=true',
        {
          q: '',
          widely: false,
          newly: true,
          limited: true,
          recent: false,
          year: '2026',
        },
      ],
      [
        '?recent=TRUE',
        {
          q: '',
          widely: true,
          newly: true,
          limited: true,
          recent: true,
          year: '2026',
        },
      ],
      [
        '?recent=',
        {
          q: '',
          widely: true,
          newly: true,
          limited: true,
          recent: false,
          year: '2026',
        },
      ],
      [
        '?year=',
        {
          q: '',
          widely: true,
          newly: true,
          limited: true,
          recent: false,
          year: '2026',
        },
      ],
      [
        '?year=2024&year=2025',
        {
          q: '',
          widely: true,
          newly: true,
          limited: true,
          recent: false,
          year: '2024',
        },
      ],
    ])('%j を読む', (search, expected) => {
      expect(read(search)).toStrictEqual(expected);
    });
  });
});

describe('browserSupportListState の URL の書き', () => {
  describe('正常系', () => {
    it.each([
      [{ widely: 'false' }, 'widely=false'],
      [{ recent: 'true' }, 'recent=true'],
      [{ year: '2024' }, 'year=2024'],
      [
        { year: '2024', newly: 'false', q: 'view' },
        'q=view&newly=false&year=2024',
      ],
    ] as const)('%j を %j と書く', (values, expected) => {
      expect(browserSupportListState.search(values)).toBe(expected);
    });

    it('既定の値は書かない', () => {
      expect(
        browserSupportListState.search({
          q: '',
          widely: 'true',
          newly: 'true',
          limited: 'true',
          recent: 'false',
          year: '',
        }),
      ).toBe('');
    });
  });

  describe('エッジケース', () => {
    it('既定と違う綴りと一覧に無い年は文字列のまま書き、既定と同じ文字列は書かない', () => {
      expect(rewrite('?widely=TRUE&recent=false&year=1999')).toBe(
        'widely=TRUE&year=1999',
      );
    });

    it('同じキーが複数あれば最初の値だけを書く', () => {
      expect(rewrite('?year=2024&year=2025&widely=false&widely=true')).toBe(
        'widely=false&year=2024',
      );
    });
  });
});
