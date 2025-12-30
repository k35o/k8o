import type { PlaygroundSection } from '../types';
import { CaretPositionDemo } from './caret-position-demo';
import { DragDropDemo } from './drag-drop-demo';

export { CaretPositionDemo } from './caret-position-demo';
export { DragDropDemo } from './drag-drop-demo';

export const caretPositionFromPointSection: PlaygroundSection = {
  id: 'caret-position-from-point',
  title: 'CaretPositionFromPoint',
  description: '座標からキャレット位置を取得するAPIです。',
  type: 'blog',
  slug: 'document-caretpositionfrompoint',
  demos: [
    {
      component: CaretPositionDemo,
      title: 'キャレット位置取得',
    },
    {
      component: DragDropDemo,
      title: 'ドラッグ&ドロップ',
    },
  ],
};
