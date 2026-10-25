import type { PlaygroundSection } from '../types';
import { CustomCommandDemo } from './custom-command-demo';
import { DialogDemo } from './dialog-demo';
import { PopoverDemo } from './popover-demo';

export const invokerCommandsSection: PlaygroundSection = {
  id: 'invoker-commands',
  title: 'Invoker Commands API',
  description: 'commandforとcommand属性でDialogやPopoverを操作する',
  category: 'html',
  type: 'blog',
  slug: 'invoker-commands',
  demos: [
    {
      component: DialogDemo,
      title: 'Dialogの操作',
      description:
        'command="show-modal"とcommandforだけで、JavaScriptを書かずにdialogをモーダル表示・閉じられます。',
    },
    {
      component: PopoverDemo,
      title: 'Popoverの操作',
      description:
        'command="toggle-popover"と従来のpopovertargetを並べ、同じPopoverを両方式で開閉できることを比較します。',
    },
    {
      component: CustomCommandDemo,
      title: 'カスタムコマンド',
      description:
        '「--」接頭辞のカスタムコマンドをcommandイベントで受け取り、画像の拡大・縮小・リセットを行います。',
    },
  ],
};
