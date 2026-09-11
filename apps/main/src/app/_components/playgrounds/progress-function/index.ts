import type { PlaygroundSection } from '../types';
import { FluidFontSizeDemo } from './fluid-font-size-demo';
import { SiblingProgressDemo } from './sibling-progress-demo';

export const progressFunctionSection: PlaygroundSection = {
  id: 'progress-function',
  title: 'progress()',
  description:
    '値が2つの境界のどこにあるかを0から1の<number>で返すCSSの関数です。長さや個数を比率に変換して、別の型のプロパティの補間に使えます。',
  category: 'css',
  type: 'blog',
  slug: 'progress-function',
  demos: [
    {
      component: FluidFontSizeDemo,
      title: '画面幅を動かして文字サイズを見る',
      description:
        '画面幅に見立てた値をスライダーで動かします。clamp()の一次式とprogress()の式が同じ大きさになり、400pxより狭い側と1200pxより広い側では両端で止まります。',
    },
    {
      component: SiblingProgressDemo,
      title: '項目数を変えても両端を固定する',
      description:
        'sibling-index()とsibling-count()をprogress()に渡し、項目数に関係なく先頭を0、末尾を1にして幅と不透明度を段階的に変えています。',
    },
  ],
};
