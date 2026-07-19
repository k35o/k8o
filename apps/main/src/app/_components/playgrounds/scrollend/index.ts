import type { PlaygroundSection } from '../types';
import { ScrollendDemo } from './scrollend-demo';
import { ScrollendTriggerDemo } from './scrollend-trigger-demo';

export { ScrollendDemo } from './scrollend-demo';
export { ScrollendTriggerDemo } from './scrollend-trigger-demo';

export const scrollendSection: PlaygroundSection = {
  id: 'scrollend',
  title: 'scrollend',
  description: 'スクロール操作が完了したときに発火するイベントです。',
  category: 'js-api',
  type: 'blog',
  slug: 'scrollend',
  demos: [
    {
      component: ScrollendDemo,
      title: 'scrollendイベント',
      description:
        'リストをスクロールすると、連続発火するscrollと停止時に1回だけ発火するscrollendの回数を比較できます。',
    },
    {
      component: ScrollendTriggerDemo,
      title: '発火条件',
      description:
        'ボタンからのscrollTo()やscroll-snapの横スクロールでもscrollendが発火することを確認できます。',
    },
  ],
};
