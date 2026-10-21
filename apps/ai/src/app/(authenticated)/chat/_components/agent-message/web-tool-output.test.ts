import { describe, expect, it } from 'vitest';

import { webFetchOutputText, webSearchOutputText } from './web-tool-output';

type WebSearchResult = Parameters<typeof webSearchOutputText>[0][number];

const searchResult = (title: string | null, url: string): WebSearchResult => ({
  type: 'web_search_result',
  url,
  title,
  pageAge: null,
  encryptedContent: '検索の結果の暗号文',
});

describe('webSearchOutputText', () => {
  describe('正常系', () => {
    it('結果ごとに、題と、次の行に URL を出し、暗号文は出さない', () => {
      expect(
        webSearchOutputText([
          searchResult('React Blog', 'https://react.dev/blog'),
          searchResult('React 19.2', 'https://react.dev/blog/react-19-2'),
        ]),
      ).toBe(
        [
          '- React Blog',
          '  https://react.dev/blog',
          '- React 19.2',
          '  https://react.dev/blog/react-19-2',
        ].join('\n'),
      );
    });
  });

  describe('エッジケース', () => {
    it('題の無い結果は、題の代わりに URL を出す', () => {
      expect(
        webSearchOutputText([searchResult(null, 'https://example.com/')]),
      ).toBe(['- https://example.com/', '  https://example.com/'].join('\n'));
    });

    it('当たりが無ければ、無かったことを出す', () => {
      expect(webSearchOutputText([])).toBe('当たりはありませんでした');
    });
  });
});

describe('webFetchOutputText', () => {
  describe('正常系', () => {
    it('1行目に URL と取得した日時、2行目に題、空けた行のあとに本文を出す', () => {
      expect(
        webFetchOutputText({
          type: 'web_fetch_result',
          url: 'https://react.dev/blog',
          retrievedAt: '2026-10-21T10:30:00Z',
          content: {
            type: 'document',
            title: 'React Blog',
            source: {
              type: 'text',
              mediaType: 'text/plain',
              data: '本文の1行目\n本文の2行目',
            },
          },
        }),
      ).toBe(
        [
          'https://react.dev/blog（2026-10-21T10:30:00Z に取得）',
          'React Blog',
          '',
          '本文の1行目',
          '本文の2行目',
        ].join('\n'),
      );
    });
  });

  describe('エッジケース', () => {
    it.each([
      ['埋めの無い', 'JVBERi0xLjQK', 'PDF（9 バイト）'],
      ['埋めが1つの', 'JVBERi0xLjQ=', 'PDF（8 バイト）'],
      ['埋めが2つの', 'JVBERi0xLg==', 'PDF（7 バイト）'],
      ['大きい', 'A'.repeat(5068), 'PDF（3,801 バイト）'],
    ])(
      'PDF は、本文の代わりに%s base64 から数えたバイト数を出す',
      (_kind, data, size) => {
        expect(
          webFetchOutputText({
            type: 'web_fetch_result',
            url: 'https://example.com/paper.pdf',
            retrievedAt: '2026-10-21T10:30:00Z',
            content: {
              type: 'document',
              title: null,
              source: { type: 'base64', mediaType: 'application/pdf', data },
            },
          }).split('\n'),
        ).toStrictEqual([
          'https://example.com/paper.pdf（2026-10-21T10:30:00Z に取得）',
          '',
          size,
        ]);
      },
    );

    it('取得した日時と題が無ければ、その分を省く', () => {
      expect(
        webFetchOutputText({
          type: 'web_fetch_result',
          url: 'https://example.com/',
          retrievedAt: null,
          content: {
            type: 'document',
            title: null,
            source: { type: 'text', mediaType: 'text/plain', data: '本文' },
          },
        }),
      ).toBe(['https://example.com/', '', '本文'].join('\n'));
    });
  });
});
