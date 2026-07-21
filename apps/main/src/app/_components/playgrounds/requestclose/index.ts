import type { PlaygroundSection } from '../types';
import { DialogRequestCloseDemo } from './dialog-requestclose-demo';

export const requestCloseSection: PlaygroundSection = {
  id: 'requestclose',
  title: 'Dialog requestClose',
  description:
    'ダイアログのrequestClose()メソッドとcancelイベントで、閉じる操作の検知と拒否ができます。',
  category: 'html',
  type: 'blog',
  slug: 'requestclose',
  demos: [
    {
      component: DialogRequestCloseDemo,
      title: 'ダイアログの閉じる動作検知',
      description:
        '名前を入力中はESCキーや閉じるボタンでの閉じる操作が拒否され、close/cancelイベントの発火がログに表示されます。',
    },
  ],
};
