import type { PlaygroundSection } from '../types';
import { ActiveViewTransitionDemo } from './active-view-transition-demo';

export { ActiveViewTransitionDemo } from './active-view-transition-demo';

export const activeViewTransitionSection: PlaygroundSection = {
  id: 'active-view-transition',
  title: ':active-view-transition-type()疑似クラス',
  description:
    'View Transitionの遷移タイプに応じて、異なるアニメーションを適用します。',
  type: 'blog',
  slug: 'active-view-transition',
  demos: [
    {
      component: ActiveViewTransitionDemo,
      title: 'タイプ別アニメーション',
    },
  ],
};
