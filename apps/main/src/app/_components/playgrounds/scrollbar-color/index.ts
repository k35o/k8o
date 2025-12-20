import type { PlaygroundSection } from '../types';
import { ScrollbarColorDemo } from './scrollbar-color-demo';

export { ScrollbarColorDemo } from './scrollbar-color-demo';

export const scrollbarColorSection: PlaygroundSection = {
  id: 'scrollbar-color',
  title: 'scrollbar-color',
  description: 'スクロールバーの色をカスタマイズするCSSプロパティです。',
  type: 'blog',
  slug: 'scrollbar-color',
  demos: [
    {
      component: ScrollbarColorDemo,
      title: 'scrollbar-colorプロパティ',
    },
  ],
};
