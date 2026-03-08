import type { PlaygroundSection } from '../types';
import { ShapeFunctionDemo } from './shape-function-demo';

export { ShapeFunctionDemo } from './shape-function-demo';

export const shapeFunctionSection: PlaygroundSection = {
  id: 'shape-function',
  title: 'shape()',
  description:
    'CSSの単位や関数をフル活用したレスポンシブな図形を定義する関数です。',
  type: 'blog',
  slug: 'shape-function',
  demos: [
    {
      component: ShapeFunctionDemo,
      title: 'path()とshape()の比較',
    },
  ],
};
