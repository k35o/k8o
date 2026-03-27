import type { PlaygroundSection } from '../types';
import { TextIndentKeywordsDemo } from './text-indent-keywords-demo';

export { TextIndentKeywordsDemo } from './text-indent-keywords-demo';

export const textIndentKeywordsSection: PlaygroundSection = {
  id: 'text-indent-keywords',
  title: 'text-indent: each-line / hanging',
  description:
    'text-indentプロパティのeach-lineとhangingキーワードでインデントを柔軟に制御できます。',
  type: 'blog',
  slug: 'text-indent-keywords',
  demos: [
    {
      component: TextIndentKeywordsDemo,
      title: 'text-indent each-line / hanging',
    },
  ],
};
