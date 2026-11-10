import type { PlaygroundSection } from '../types';
import { PopoverApiDemo } from './popover-api-demo';

export const popoverSection: PlaygroundSection = {
  id: 'popover',
  title: 'Popover API',
  description:
    'JavaScriptなしでツールチップやドロップダウンメニューを実装できるAPIです。',
  category: 'html',
  type: 'blog',
  slug: 'popover',
  demos: [
    {
      component: PopoverApiDemo,
      title: '基本的なポップオーバー',
      description:
        'toggle・show・hideの3つのpopovertargetactionの違いを試せます。ESCキーや外側クリックでも閉じられます。',
    },
  ],
};
