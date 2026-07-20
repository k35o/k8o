import type { PlaygroundSection } from '../types';
import { HighlightBasicDemo } from './highlight-basic-demo';
import { HighlightPriorityDemo } from './highlight-priority-demo';
import { HighlightSpellingDemo } from './highlight-spelling-demo';

export const highlightSection: PlaygroundSection = {
  id: 'highlight',
  title: 'CSS Custom Highlight API',
  description: 'DOMを変更せずに任意のテキスト範囲をハイライトできるAPIです。',
  category: 'css',
  type: 'blog',
  slug: 'highlight',
  demos: [
    {
      component: HighlightBasicDemo,
      title: '基本的なハイライト',
      description:
        'Rangeで指定した文字範囲をCSS.highlightsに登録し、::highlight()で一部だけ色付けします。',
    },
    {
      component: HighlightPriorityDemo,
      title: '優先度ベースハイライト',
      description:
        '同じ範囲に3つのハイライトを重ね、priorityが高いもののスタイルが優先されることを確かめます。',
    },
    {
      component: HighlightSpellingDemo,
      title: 'スペリング・文法エラーハイライト',
      description:
        'Highlightのtypeにspelling-errorを指定し、誤字としての意味付けを持つハイライトを表示します。',
    },
  ],
};
