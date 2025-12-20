import type { PlaygroundSection } from '../types';
import { ScrollendDemo } from './scrollend-demo';
import { ScrollendTriggerDemo } from './scrollend-trigger-demo';

export { ScrollendDemo } from './scrollend-demo';
export { ScrollendTriggerDemo } from './scrollend-trigger-demo';

export const scrollendSection: PlaygroundSection = {
  id: 'scrollend',
  title: 'scrollend',
  description: 'スクロール操作が完了したときに発火するイベントです。',
  type: 'blog',
  slug: 'scrollend',
  demos: [
    {
      component: ScrollendDemo,
      title: 'scrollendイベント',
    },
    {
      component: ScrollendTriggerDemo,
      title: '発火条件',
    },
  ],
};
