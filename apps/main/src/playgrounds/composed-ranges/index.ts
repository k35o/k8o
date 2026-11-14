import type { PlaygroundSection } from '../types';
import { GetComposedRanges } from './get-composed-ranges';

export const composedRangesSection: PlaygroundSection = {
  id: 'composed-ranges',
  title: 'getComposedRanges',
  description:
    'Shadow DOMの中を選んだ範囲を、getRangeAtとgetComposedRangesで取り出したときの違いを比べられます。',
  category: 'js-api',
  type: 'blog',
  slug: 'composed-ranges',
  demos: [
    {
      component: GetComposedRanges,
      title: 'getRangeAtとgetComposedRangesの比較',
      description:
        '閉じたShadow Tree内の選択で、getRangeAtとgetComposedRangesが返す範囲の違いを比較できます。',
    },
  ],
};
