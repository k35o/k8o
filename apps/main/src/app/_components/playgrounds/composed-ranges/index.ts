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
  category: 'js-api',
  type: 'blog',
  slug: 'composed-ranges',
  demos: [
    {
      component: SelectionProperties,
      title: 'Selectionオブジェクトのプロパティ',
      description:
        'テキストを選択すると、選択文字列や開始・終了位置、選択の種類がリアルタイムに表示されます。',
    },
    {
      component: SelectionMethods,
      title: 'Selectionオブジェクトのメソッド',
      description:
        'ボタンからaddRangeやextendなどを呼び出し、選択範囲をスクリプトで作成・削除・拡張できます。',
    },
    {
      component: GetComposedRanges,
      title: 'Baseline 2025で追加されたgetComposedRangesメソッド',
      description:
        '閉じたShadow Tree内の選択で、getRangeAtとgetComposedRangesが返す範囲の違いを比較できます。',
    },
  ],
};
