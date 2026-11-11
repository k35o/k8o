import type { PlaygroundSection } from '../types';
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
  ],
};
