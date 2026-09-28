import type { PlaygroundSection } from '../types';
import { AnnouncementDemo } from './announcement-demo';

export const ariaNotifySection: PlaygroundSection = {
  id: 'arianotify',
  title: 'ariaNotify()',
  description:
    '任意の文字列をスクリーンリーダーに読み上げさせるDocumentとElementのメソッドです。',
  category: 'js-api',
  type: 'blog',
  slug: 'arianotify',
  demos: [
    {
      component: AnnouncementDemo,
      title: '文字列を読み上げさせる',
      description:
        '入力した文字列をボタン要素のariaNotify()に渡し、priorityと祖先のlang属性を変えたときの読み上げ方をスクリーンリーダーで確認できます。',
    },
  ],
};
