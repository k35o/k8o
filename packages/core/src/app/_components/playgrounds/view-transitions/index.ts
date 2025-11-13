import type { PlaygroundSection } from '../types';
import { ViewTransitionBasicDemo } from './view-transition-basic-demo';

export { ViewTransitionBasicDemo } from './view-transition-basic-demo';

export const viewTransitionsSection: PlaygroundSection = {
  id: 'view-transitions',
  title: 'View Transition API',
  description: 'DOMの更新にアニメーションを適用するAPIです。',
  type: 'blog',
  slug: 'view-transitions',
  demos: [
    {
      component: ViewTransitionBasicDemo,
      title: 'View Transition基本デモ',
    },
  ],
};
