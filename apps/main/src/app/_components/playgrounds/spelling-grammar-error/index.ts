import type { PlaygroundSection } from '../types';
import { SpellingGrammarErrorDemo } from './spelling-grammar-error-demo';
import { TextDecorationErrorDemo } from './text-decoration-error-demo';

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
      component: TextDecorationErrorDemo,
      title: 'text-decoration-lineによるエラー風装飾',
      description:
        'エラー検出とは無関係に、ブラウザ標準のエラー表示と同じ装飾を任意のテキストへ描きます。',
    },
    {
      component: SpellingGrammarErrorDemo,
      title: 'スペル・文法エラースタイリング',
      description:
        '編集可能な英文で、検出されたスペルミスが波線と背景色で表示されます。文法エラーの装飾は、ブラウザが文法チェックを持つ環境でのみ表示されます。',
    },
  ],
};
