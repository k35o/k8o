import { describe, expect, it } from 'vitest';

import { extractPageBlocks } from './pdf-page-text';
import type { PdfTextContentItem } from './pdf-page-text';

const view = [0, 0, 1000, 500];

const text = (
  str: string,
  x: number,
  y: number,
  width: number,
  size = 20,
): PdfTextContentItem => ({
  str,
  transform: [size, 0, 0, size, x, y],
  width,
});

const marked = (
  id: string,
  ...items: PdfTextContentItem[]
): PdfTextContentItem[] => [
  { type: 'beginMarkedContentProps', id },
  ...items,
  { type: 'endMarkedContent' },
];

const content = (id: string) => ({ type: 'content', id });

const textsOf = (blocks: ReturnType<typeof extractPageBlocks>) =>
  blocks.map((block) =>
    block.tag === 'img'
      ? [block.tag, block.alt]
      : [block.tag, block.lines.map((line) => line.text)],
  );

describe('extractPageBlocks', () => {
  describe('正常系', () => {
    it('行の位置と大きさを、左上を原点にしたページに対する割合にする', () => {
      expect(
        extractPageBlocks({
          view,
          tree: null,
          items: [text('題', 100, 400, 200, 50)],
        }),
      ).toStrictEqual([
        {
          tag: 'p',
          lines: [
            { text: '題', left: 0.1, top: 0.112, width: 0.2, height: 0.1 },
          ],
        },
      ]);
    });

    it('タグ付きの PDF は、構造の順に見出しと段落にする', () => {
      expect(
        textsOf(
          extractPageBlocks({
            view,
            tree: {
              role: 'Root',
              children: [
                { role: 'H2', children: [content('title')] },
                { role: 'P', children: [content('body')] },
              ],
            },
            items: [
              ...marked('body', text('本文', 100, 300, 40)),
              ...marked('title', text('見出し', 100, 400, 60)),
            ],
          }),
        ),
      ).toStrictEqual([
        ['h2', ['見出し']],
        ['p', ['本文']],
      ]);
    });

    it('段落の中のリンクの文字は、同じ段落に入れる', () => {
      expect(
        textsOf(
          extractPageBlocks({
            view,
            tree: {
              role: 'P',
              children: [
                content('before'),
                { role: 'Link', children: [content('link')] },
              ],
            },
            items: [
              ...marked('before', text('詳しくは', 100, 400, 80)),
              ...marked('link', text('ブログ', 180, 400, 60)),
            ],
          }),
        ),
      ).toStrictEqual([['p', ['詳しくはブログ']]]);
    });

    it('代替テキストのある図は、構造の順に画像として挟む', () => {
      expect(
        textsOf(
          extractPageBlocks({
            view,
            tree: {
              role: 'Root',
              children: [
                { role: 'Figure', alt: '会社の紹介', children: [] },
                { role: 'P', children: [content('body')] },
              ],
            },
            items: marked('body', text('本文', 100, 300, 40)),
          }),
        ),
      ).toStrictEqual([
        ['img', '会社の紹介'],
        ['p', ['本文']],
      ]);
    });

    it('同じ行に続く文字は 1 行にまとめ、空きには空白を 1 つ入れる', () => {
      expect(
        textsOf(
          extractPageBlocks({
            view,
            tree: null,
            items: [
              text('const', 100, 400, 50),
              text(' ', 150, 400, 10),
              text('key', 160, 400, 30),
              text(' = 1', 190, 400, 40),
            ],
          }),
        ),
      ).toStrictEqual([['p', ['const key = 1']]]);
    });

    it('タグの無い PDF は、行送りの続く行を 1 つの段落にする', () => {
      expect(
        textsOf(
          extractPageBlocks({
            view,
            tree: null,
            items: [
              text('1 行目', 100, 400, 60),
              text('2 行目', 100, 370, 60),
              text('離れた段落', 100, 200, 100),
            ],
          }),
        ),
      ).toStrictEqual([
        ['p', ['1 行目', '2 行目']],
        ['p', ['離れた段落']],
      ]);
    });
  });

  describe('エッジケース', () => {
    it('同じ高さでも離れた列は、別の行にする', () => {
      expect(
        textsOf(
          extractPageBlocks({
            view,
            tree: null,
            items: [
              text('左の列', 100, 400, 60),
              text(' ', 160, 400, 340),
              text('右の列', 500, 400, 60),
            ],
          }),
        ),
      ).toStrictEqual([
        ['p', ['左の列']],
        ['p', ['右の列']],
      ]);
    });

    it('空白だけの文字とページの外の文字は入れない', () => {
      expect(
        extractPageBlocks({
          view,
          tree: null,
          items: [
            text(' ', 100, 400, 10),
            text('', 100, 400, 0),
            text('紙の外', 100, -80, 60),
            text('右の外', 1100, 400, 60),
          ],
        }),
      ).toStrictEqual([]);
    });

    it('構造に無い文字も落とさない', () => {
      expect(
        textsOf(
          extractPageBlocks({
            view,
            tree: { role: 'P', children: [content('body')] },
            items: [
              ...marked('body', text('本文', 100, 400, 40)),
              text('欄外', 100, 100, 40),
            ],
          }),
        ),
      ).toStrictEqual([
        ['p', ['本文']],
        ['p', ['欄外']],
      ]);
    });
  });
});
