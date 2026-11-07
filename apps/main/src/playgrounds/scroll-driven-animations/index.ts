import type { PlaygroundSection } from '../types';
import { ScrollProgressDemo } from './scroll-progress-demo';
import { ViewRangeDemo } from './view-range-demo';

export const scrollDrivenAnimationsSection: PlaygroundSection = {
  id: 'scroll-driven-animations',
  title: 'Scroll-driven animations',
  description:
    '時間ではなくスクロールの位置に合わせて、CSSのアニメーションを進めます。',
  category: 'css',
  type: 'blog',
  slug: 'scroll-driven-animations',
  demos: [
    {
      component: ScrollProgressDemo,
      title: 'スクロール量をプログレスバーで示す',
      description:
        'animation-timeline: scroll()で、スクロールコンテナを読み進めた割合に合わせてプログレスバーを伸ばします。',
    },
    {
      component: ViewRangeDemo,
      title: 'animation-rangeを切り替えて進む区間を比べる',
      description:
        'animation-timeline: view()でカードを左から少しずつ表示し、animation-rangeを切り替えてカードが現れる区間を比べられます。',
    },
  ],
};
