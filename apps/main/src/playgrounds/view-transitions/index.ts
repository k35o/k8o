import type { PlaygroundSection } from '../types';
import { ViewTransitionPseudoDemo } from './view-transition-pseudo-demo';
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
      component: ViewTransitionPseudoDemo,
      title: '擬似要素を1つずつ見る',
      description:
        '1秒かけて動く遷移で、擬似要素を1つずつ目立たせたり隠したりします。',
    },
  ],
};
