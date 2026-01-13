import type { PlaygroundSection } from '../types';
import { CustomCommandDemo } from './custom-command-demo';
import { DialogDemo } from './dialog-demo';
import { PopoverDemo } from './popover-demo';

export { CustomCommandDemo } from './custom-command-demo';
export { DialogDemo } from './dialog-demo';
export { PopoverDemo } from './popover-demo';

export const invokerCommandsSection: PlaygroundSection = {
  id: 'invoker-commands',
  title: 'Invoker Commands API',
  description: 'commandforとcommand属性でDialogやPopoverを操作する',
  type: 'blog',
  slug: 'invoker-commands',
  demos: [
    { component: DialogDemo, title: 'Dialogの操作' },
    { component: PopoverDemo, title: 'Popoverの操作' },
    { component: CustomCommandDemo, title: 'カスタムコマンド' },
  ],
};
