import type { PlaygroundSection } from '../types';
import { CaretPositionDemo } from './caret-position-demo';
import { DragDropDemo } from './drag-drop-demo';

export const caretPositionFromPointSection: PlaygroundSection = {
  id: 'caret-position-from-point',
  title: 'CaretPositionFromPoint',
  description: '座標からキャレット位置を取得するAPIです。',
  category: 'js-api',
  type: 'blog',
  slug: 'document-caretpositionfrompoint',
  demos: [
    {
      component: CaretPositionDemo,
      title: 'キャレット位置取得',
      description:
        'テキストをクリックすると、その座標のoffsetNodeとoffsetを表示し、キャレットの立つ位置を可視化します。',
    },
    {
      component: DragDropDemo,
      title: 'ドラッグ&ドロップ',
      description:
        '単語チップを文章の好きな位置にドロップすると、ドロップ座標から求めたオフセットに単語を挿入します。',
    },
  ],
};
