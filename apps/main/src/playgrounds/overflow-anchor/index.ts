import type { PlaygroundSection } from '../types';
import { AnchorExclusionDemo } from './anchor-exclusion-demo';
import { ScrollAnchoringDemo } from './scroll-anchoring-demo';

export const overflowAnchorSection: PlaygroundSection = {
  id: 'overflow-anchor',
  title: 'overflow-anchor',
  description:
    '表示領域より上でレイアウトが変わったときに、見えている要素を固定するスクロールアンカリングの補正を外すCSSプロパティです。',
  category: 'css',
  type: 'blog',
  slug: 'overflow-anchor',
  demos: [
    {
      component: ScrollAnchoringDemo,
      title: '表示領域より上に要素を足したときの補正を見る',
      description:
        '途中までスクロールしたリストの先頭に要素を追加し、overflow-anchorがautoのときとnoneのときで見えている要素がずれるかを比較できます。',
    },
    {
      component: AnchorExclusionDemo,
      title: '高さが変わる要素を候補から外す',
      description:
        '表示領域の上端にあるスケルトンが読み込み完了で背が高くなるとき、スケルトンにoverflow-anchor: noneを付けた場合と付けない場合で、直後のアイテムが押し出されるかを比較できます。',
    },
  ],
};
