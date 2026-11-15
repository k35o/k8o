import type { PlaygroundSection } from '../types';
import { RootComparisonDemo } from './root-comparison-demo';
import { UnitComparisonDemo } from './unit-comparison-demo';

export const rootFontUnitsSection: PlaygroundSection = {
  id: 'root-font-units',
  title: 'rcap, rch, rex, ric',
  description: 'ルート要素のフォントの特性に基づいたCSSの長さ単位です。',
  category: 'css',
  type: 'blog',
  slug: 'root-font-units',
  demos: [
    {
      component: UnitComparisonDemo,
      title: '単位の比較',
      description:
        '文字とバーを4倍で並べ、ricが水の幅、rchが0の幅、rcapがHの高さ、rexがxの高さに当たることを見比べられます。',
    },
    {
      component: RootComparisonDemo,
      title: '通常版とルート版の違い',
      description:
        'font-sizeを変えると、chは親のfont-sizeに連動して伸縮し、rchはルート基準のまま変わらないことを確認できます。',
    },
  ],
};
