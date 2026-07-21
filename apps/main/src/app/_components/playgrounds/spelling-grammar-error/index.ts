import type { PlaygroundSection } from '../types';
import { SpellingGrammarErrorDemo } from './spelling-grammar-error-demo';

export const spellingGrammarErrorSection: PlaygroundSection = {
  id: 'spelling-grammar-error',
  title: 'CSS spelling-error & grammar-error',
  description:
    'ブラウザが検出したスペルミスや文法エラーのスタイリングを制御します。',
  category: 'css',
  type: 'blog',
  slug: 'spelling-grammar-error',
  demos: [
    {
      component: SpellingGrammarErrorDemo,
      title: 'スペル・文法エラースタイリング',
      description:
        '編集可能な英文にフォーカスすると、スペルミスが波線＋背景色、文法エラーが点線下線で表示されます。',
    },
  ],
};
