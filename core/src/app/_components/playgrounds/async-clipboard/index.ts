import { PlaygroundSection } from '../types';
import { ClipboardImageDemo } from './clipboard-image-demo';
import { ClipboardTextDemo } from './clipboard-text-demo';

export { ClipboardImageDemo, ClipboardTextDemo };

export const asyncClipboardSection: PlaygroundSection = {
  id: 'async-clipboard',
  title: 'Clipboard API',
  description:
    'ブラウザのクリップボードに任意のデータをコピー・ペーストできるAPIです。',
  type: 'blog',
  slug: 'async-clipboard',
  demos: [
    {
      component: ClipboardTextDemo,
      title: 'テキストのコピー・ペースト',
    },
    {
      component: ClipboardImageDemo,
      title: '画像のコピー・ペースト',
    },
  ],
};
