import { filterPlaygrounds } from './filter-playgrounds';
import type { PlaygroundSummary } from './types';

const createPlayground = (
  overrides: Partial<PlaygroundSummary>,
): PlaygroundSummary => ({
  id: 'section',
  title: 'タイトル',
  description: '説明',
  category: 'css',
  demoCount: 1,
  demoTexts: [],
  hasBlog: false,
  ...overrides,
});

const playgrounds: PlaygroundSummary[] = [
  createPlayground({
    id: 'view-transitions',
    title: 'View Transition API',
    description: 'DOMの更新にアニメーションを適用するAPIです。',
    category: 'js-api',
    demoTexts: ['View Transition基本デモ', 'クロスフェードで切り替えます'],
  }),
  createPlayground({
    id: 'container-style-queries',
    title: 'コンテナスタイルクエリ',
    description: 'コンテナのスタイルに応じて子要素のスタイルを変えます。',
    category: 'css',
    demoTexts: ['テーマ切り替え'],
  }),
  createPlayground({
    id: 'popover',
    title: 'Popover API',
    description: 'HTMLだけでポップオーバーを実現します。',
    category: 'html',
    demoTexts: ['基本のポップオーバー'],
  }),
];

describe('filterPlaygrounds', () => {
  describe('正常系', () => {
    it('クエリが空のときは全件を返すべき', () => {
      const result = filterPlaygrounds(playgrounds, '');
      expect(result).toHaveLength(3);
    });

    it('タイトルに部分一致するクエリで絞り込めるべき（大文字小文字を無視）', () => {
      const result = filterPlaygrounds(playgrounds, 'popover');
      expect(result.map((p) => p.id)).toStrictEqual(['popover']);
    });

    it('description に一致するクエリで絞り込めるべき', () => {
      const result = filterPlaygrounds(playgrounds, 'アニメーション');
      expect(result.map((p) => p.id)).toStrictEqual(['view-transitions']);
    });

    it('デモのタイトル・説明に一致するクエリで絞り込めるべき', () => {
      const result = filterPlaygrounds(playgrounds, 'テーマ切り替え');
      expect(result.map((p) => p.id)).toStrictEqual([
        'container-style-queries',
      ]);
    });

    it('カテゴリの表示名で絞り込めるべき（js-api → Web API）', () => {
      const result = filterPlaygrounds(playgrounds, 'web api');
      expect(result.map((p) => p.id)).toStrictEqual(['view-transitions']);
    });
  });

  describe('エッジケース', () => {
    it('全角英数のクエリを正規化してヒットさせるべき（Ｐｏｐｏｖｅｒ → Popover）', () => {
      const result = filterPlaygrounds(playgrounds, 'Ｐｏｐｏｖｅｒ');
      expect(result.map((p) => p.id)).toStrictEqual(['popover']);
    });

    it('複数トークンは AND で評価し、全角スペース区切りも吸収するべき', () => {
      const result = filterPlaygrounds(playgrounds, 'view　基本');
      expect(result.map((p) => p.id)).toStrictEqual(['view-transitions']);
    });

    it('空白のみのクエリは条件なしとして扱うべき', () => {
      const result = filterPlaygrounds(playgrounds, '   ');
      expect(result).toHaveLength(3);
    });

    it('一致しない条件では 0 件を返すべき', () => {
      const result = filterPlaygrounds(playgrounds, '存在しない');
      expect(result).toHaveLength(0);
    });
  });

  describe('非破壊・順序保持', () => {
    it('入力配列を破壊せず、結果は入力順を保持するべき', () => {
      const input = [...playgrounds];
      const result = filterPlaygrounds(input, 'api');
      expect(input).toStrictEqual(playgrounds);
      expect(result.map((p) => p.id)).toStrictEqual([
        'view-transitions',
        'popover',
      ]);
    });
  });
});
