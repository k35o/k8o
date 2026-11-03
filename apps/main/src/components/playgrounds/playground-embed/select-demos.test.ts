import type { PlaygroundSection } from '@playgrounds/types';
import { describe, expect, it } from 'vitest';

import { selectDemos } from './select-demos';

const Demo = (): null => null;

const section = (titles: readonly string[]): PlaygroundSection => ({
  id: 'popover',
  title: 'Popover API',
  description: 'HTMLだけでポップオーバーを実現します。',
  category: 'html',
  type: 'blog',
  slug: 'popover',
  demos: titles.map((title) => ({
    component: Demo,
    title,
    description: `${title}の説明`,
  })),
});

describe('selectDemos', () => {
  describe('正常系', () => {
    it('demo の題と一致するデモだけを返す', () => {
      const demos = selectDemos(
        section(['基本的なポップオーバー', 'ツールチップ・ドロップダウン']),
        'ツールチップ・ドロップダウン',
      );

      expect(demos.map(({ title }) => title)).toStrictEqual([
        'ツールチップ・ドロップダウン',
      ]);
    });

    it('demo を省くと、セクションのデモをすべて返す', () => {
      const demos = selectDemos(
        section(['基本的なポップオーバー', 'ツールチップ・ドロップダウン']),
        undefined,
      );

      expect(demos.map(({ title }) => title)).toStrictEqual([
        '基本的なポップオーバー',
        'ツールチップ・ドロップダウン',
      ]);
    });
  });

  describe('異常系', () => {
    it('demo の題と一致するデモが無ければ、セクションと題を名指して投げる', () => {
      expect(() =>
        selectDemos(section(['基本的なポップオーバー']), '存在しないデモ'),
      ).toThrow('Playgroundデモが見つかりません: popover / 存在しないデモ');
    });
  });

  describe('エッジケース', () => {
    it('デモの無いセクションは、demo を省いても投げる', () => {
      expect(() => selectDemos(section([]), undefined)).toThrow(
        'Playgroundデモが見つかりません: popover / ',
      );
    });
  });
});
