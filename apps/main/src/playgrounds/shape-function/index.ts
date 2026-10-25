import type { PlaygroundSection } from '../types';
import { ShapeFunctionDemo } from './shape-function-demo';

export const shapeFunctionSection: PlaygroundSection = {
  id: 'shape-function',
  title: 'shape()',
  description:
    'CSSの単位や関数をフル活用したレスポンシブな図形を定義する関数です。',
  category: 'css',
  type: 'blog',
  slug: 'shape-function',
  demos: [
    {
      component: ShapeFunctionDemo,
      title: 'path()とshape()の比較',
      description:
        'スライダーで幅を変えると、固定px指定のpath()は三角形が崩れ、%指定のshape()は形を保つことを確認できます。',
    },
  ],
};
