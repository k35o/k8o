import type { PlaygroundSection } from '../types';
import { ScrollbarColorDemo } from './scrollbar-color-demo';

export { ScrollbarColorDemo } from './scrollbar-color-demo';

export const scrollbarColorSection: PlaygroundSection = {
  id: 'scrollbar-color',
  title: 'scrollbar-color',
  description: 'スクロールバーの色をカスタマイズするCSSプロパティです。',
  category: 'css',
  type: 'blog',
  slug: 'scrollbar-color',
  demos: [
    {
      component: ScrollbarColorDemo,
      title: 'scrollbar-colorプロパティ',
      description:
        'カラーピッカーでつまみとトラックの色を選ぶと、スクロールバーに即座に反映され、生成されるCSS宣言も確認できます。',
    },
  ],
};
