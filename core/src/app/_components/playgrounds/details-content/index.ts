import type { PlaygroundSection } from '../types';
import { DetailsAnimationDemo } from './details-animation-demo';
import { DetailsContentDemo } from './details-content-demo';

export { DetailsAnimationDemo } from './details-animation-demo';
export { DetailsContentDemo } from './details-content-demo';

export const detailsContentSection: PlaygroundSection = {
  id: 'details-content',
  title: '::details-content擬似要素',
  description:
    'details要素の開閉時にスムーズなアニメーションをCSSだけで実装できる擬似要素です。',
  type: 'blog',
  slug: 'details-content',
  demos: [
    {
      component: DetailsContentDemo,
      title: 'スタイリング例',
    },
    {
      component: DetailsAnimationDemo,
      title: 'アニメーション実装パターン',
    },
  ],
};
