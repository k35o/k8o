import type { PlaygroundSection } from '../types';
import { ViewTransitionBasicDemo } from './view-transition-basic-demo';
import { ViewTransitionReverseDemo } from './view-transition-reverse-demo';

export const viewTransitionsSection: PlaygroundSection = {
  id: 'view-transitions',
  title: 'View Transition API',
  description: 'DOMの更新にアニメーションを適用するAPIです。',
  category: 'js-api',
  type: 'blog',
  slug: 'view-transitions',
  demos: [
    {
      component: ViewTransitionReverseDemo,
      title: 'リストの並びを逆にする',
      description:
        'startViewTransitionでリストの並びを逆にし、AとCが互いの位置へ滑るように動くことを確かめます。',
    },
    {
      component: ViewTransitionBasicDemo,
      title: 'View Transition基本デモ',
      description:
        'カードのシャッフル・追加・削除を滑らかに繋げます。ON/OFFの切り替えで効果の違いを比較できます。',
    },
  ],
};
