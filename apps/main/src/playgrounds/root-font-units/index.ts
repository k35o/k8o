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
        '文字とバーを4倍で並べ、ricは「水」の幅、rchは「0」の幅、rcapはHの高さ、rexはxの高さに対応することを示します。',
    },
    {
      component: RootComparisonDemo,
      title: '通常版とルート版の違い',
      description:
        'font-sizeを変えると、chは親のfont-sizeに連動して伸縮し、rchはルート基準のまま変わらないことを確認できます。',
    },
  ],
};
