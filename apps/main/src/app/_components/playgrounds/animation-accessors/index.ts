import type { PlaygroundSection } from '../types';
import { AnimationAccessorsDemo } from './animation-accessors-demo';

export const animationAccessorsSection: PlaygroundSection = {
  id: 'animation-accessors',
  title: 'Animation accessors',
  description:
    'animationstartやtransitionendなどのイベントに、発火元のCSSAnimation / CSSTransitionをevent.animationとして載せるプロパティです。',
  category: 'js-api',
  type: 'blog',
  slug: 'animation-accessors',
  demos: [
    {
      component: AnimationAccessorsDemo,
      title: '同じ名前の2本のアニメーションをevent.animationで区別する',
      description:
        '同じ@keyframesを長さ違いで2本指定した要素のイベントを記録し、animationNameでは同じに見える2本をevent.animationのdurationで見分けられる様子を確認できます。animationendでは、終わったアニメーションがgetAnimations()から外れていることも分かります。',
    },
  ],
};
