import type { PlaygroundSection } from '../types';
import { GetComposedRanges } from './get-composed-ranges';
import { SelectionMethods } from './selection-methods';
import { SelectionProperties } from './selection-properties';

export { GetComposedRanges } from './get-composed-ranges';
export { SelectionMethods } from './selection-methods';
export { SelectionProperties } from './selection-properties';

export const composedRangesSection: PlaygroundSection = {
  id: 'composed-ranges',
  title: 'Selectionオブジェクト',
  description:
    'ユーザーが選択したテキストの範囲やキャレットの位置を扱うSelectionオブジェクトの紹介です。',
  type: 'blog',
  slug: 'composed-ranges',
  demos: [
    {
      component: SelectionProperties,
      title: 'Selectionオブジェクトのプロパティ',
    },
    {
      component: SelectionMethods,
      title: 'Selectionオブジェクトのメソッド',
    },
    {
      component: GetComposedRanges,
      title: 'Baseline 2025で追加されたgetComposedRangesメソッド',
    },
  ],
};
