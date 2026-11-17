import type { PlaygroundSection } from '../types';
import { ClipboardImageDemo } from './clipboard-image-demo';
import { ClipboardTextDemo } from './clipboard-text-demo';

export const asyncClipboardSection: PlaygroundSection = {
  id: 'async-clipboard',
  title: 'Clipboard API',
  description:
    'ブラウザのクリップボードに任意のデータをコピー・ペーストできるAPIです。',
  category: 'js-api',
  type: 'blog',
  slug: 'async-clipboard',
  demos: [
    {
      component: ClipboardTextDemo,
      title: 'テキストのコピー・ペースト',
      description:
        'writeTextとreadTextで、入力欄のテキストをコピーし、クリップボードのテキストを入力欄の末尾に貼り付けます。',
    },
    {
      component: ClipboardImageDemo,
      title: '画像のコピー・ペースト',
      description:
        '選択した画像をCanvasでPNG化しClipboardItemとしてコピーします。クリップボード内のPNG画像を読み取って表示もできます。',
    },
  ],
};
