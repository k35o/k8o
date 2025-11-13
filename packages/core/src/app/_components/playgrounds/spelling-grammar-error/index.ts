import type { PlaygroundSection } from '../types';
import { SpellingGrammarErrorDemo } from './spelling-grammar-error-demo';

export { SpellingGrammarErrorDemo } from './spelling-grammar-error-demo';

export const spellingGrammarErrorSection: PlaygroundSection = {
  id: 'spelling-grammar-error',
  title: 'CSS spelling-error & grammar-error',
  description:
    'ブラウザが検出したスペルミスや文法エラーのスタイリングを制御します。',
  type: 'blog',
  slug: 'spelling-grammar-error',
  demos: [
    {
      component: SpellingGrammarErrorDemo,
      title: 'スペル・文法エラースタイリング',
    },
  ],
};
