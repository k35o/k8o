import type { PlaygroundSection } from '../types';
import { AlphaValueDemo } from './alpha-value-demo';
import { TokenDerivationDemo } from './token-derivation-demo';

export const alphaFunctionSection: PlaygroundSection = {
  id: 'alpha-function',
  title: 'alpha()',
  description:
    '元の色の色成分と色空間を保ったまま、アルファチャンネルだけを差し替えるCSSの関数です。',
  category: 'css',
  type: 'blog',
  slug: 'alpha-function',
  demos: [
    {
      component: AlphaValueDemo,
      title: '固定値と相対値の違いを見る',
      description:
        '不透明度60%の色を元にして、固定値を渡した場合とalphaキーワードで相対値を渡した場合の違いをスライダーで確認できます。',
    },
    {
      component: TokenDerivationDemo,
      title: 'トークンを差し替えて派生色を追従させる',
      description:
        '--brandの色相を動かすと、alpha()で導いた--brand-subtleと--brand-glowが同じ色相のまま追従します。',
    },
  ],
};
