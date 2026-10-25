import type { PlaygroundSection } from '../types';
import { PopoverApiDemo } from './popover-api-demo';
import { TooltipDropdownDemo } from './tooltip-dropdown-demo';

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
    {
      component: TooltipDropdownDemo,
      title: 'ツールチップ・ドロップダウン',
      description:
        'Popover APIを使わない従来型のツールチップとドロップダウンメニューの実装例です。',
    },
  ],
};
