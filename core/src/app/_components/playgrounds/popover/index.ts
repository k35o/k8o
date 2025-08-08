import type { PlaygroundSection } from '../types';
import { PopoverApiDemo } from './popover-api-demo';
import { TooltipDropdownDemo } from './tooltip-dropdown-demo';

export { PopoverApiDemo } from './popover-api-demo';
export { TooltipDropdownDemo } from './tooltip-dropdown-demo';

export const popoverSection: PlaygroundSection = {
  id: 'popover',
  title: 'Popover API',
  description:
    'JavaScriptなしでツールチップやドロップダウンメニューを実装できるAPIです。',
  type: 'blog',
  slug: 'popover',
  demos: [
    { component: PopoverApiDemo, title: '基本的なポップオーバー' },
    {
      component: TooltipDropdownDemo,
      title: 'ツールチップ・ドロップダウン',
    },
  ],
};
