import type { PlaygroundSection } from '../types';
import { RootComparisonDemo } from './root-comparison-demo';
import { UnitComparisonDemo } from './unit-comparison-demo';

export { RootComparisonDemo } from './root-comparison-demo';
export { UnitComparisonDemo } from './unit-comparison-demo';

export const rootFontUnitsSection: PlaygroundSection = {
  id: 'root-font-units',
  title: 'rcap, rch, rex, ric',
  description: 'ルート要素のフォントの特性に基づいたCSSの長さ単位です。',
  type: 'blog',
  slug: 'root-font-units',
  demos: [
    {
      component: UnitComparisonDemo,
      title: '単位の比較',
    },
    {
      component: RootComparisonDemo,
      title: '通常版とルート版の違い',
    },
  ],
};
