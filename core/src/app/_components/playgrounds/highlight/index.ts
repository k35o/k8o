import type { PlaygroundSection } from '../types';
import { HighlightBasicDemo } from './highlight-basic-demo';
import { HighlightPriorityDemo } from './highlight-priority-demo';
import { HighlightSpellingDemo } from './highlight-spelling-demo';

export { HighlightBasicDemo } from './highlight-basic-demo';
export { HighlightPriorityDemo } from './highlight-priority-demo';
export { HighlightSpellingDemo } from './highlight-spelling-demo';

export const highlightSection: PlaygroundSection = {
  id: 'highlight',
  title: 'CSS Custom Highlight API',
  description: 'DOMを変更せずに任意のテキスト範囲をハイライトできるAPIです。',
  type: 'blog',
  slug: 'highlight',
  demos: [
    { component: HighlightBasicDemo, title: '基本的なハイライト' },
    {
      component: HighlightPriorityDemo,
      title: '優先度ベースハイライト',
    },
    {
      component: HighlightSpellingDemo,
      title: 'スペリング・文法エラーハイライト',
    },
  ],
};
