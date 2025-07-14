import { PlaygroundSection } from '../types';
import { PopoverApiDemo } from './popover-api-demo';
import { TooltipDropdownDemo } from './tooltip-dropdown-demo';

export { PopoverApiDemo, TooltipDropdownDemo };

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
