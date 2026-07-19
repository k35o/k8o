import type { PlaygroundSection } from '../types';
import { BaselineShiftDemo } from './baseline-shift-demo';

export { BaselineShiftDemo } from './baseline-shift-demo';

export const baselineShiftSection: PlaygroundSection = {
  id: 'baseline-shift',
  title: 'baseline-shift',
  description:
    'インラインレベル要素のベースラインを親要素から相対的にずらすCSSプロパティです。SVGとHTMLをまたいで同じプロパティで扱えます。',
  category: 'css',
  type: 'blog',
  slug: 'baseline-shift',
  demos: [
    {
      component: BaselineShiftDemo,
      title: 'baseline-shift値の比較',
      description:
        'セレクトでsub/superなどの値を切り替えると、化学式の下付き文字や注釈記号が破線のベースラインからずれる様子を比較できます。',
    },
  ],
};
