import type { PlaygroundSection } from '../types';
import { DialogRequestCloseDemo } from './dialog-requestclose-demo';

export { DialogRequestCloseDemo } from './dialog-requestclose-demo';

export const requestCloseSection: PlaygroundSection = {
  id: 'requestclose',
  title: 'Dialog requestClose',
  description:
    'ダイアログのrequestCloseイベントでESCキーやクリック以外の閉じる動作を検知できます。',
  type: 'blog',
  slug: 'requestclose',
  demos: [
    {
      component: DialogRequestCloseDemo,
      title: 'ダイアログの閉じる動作検知',
    },
  ],
};
