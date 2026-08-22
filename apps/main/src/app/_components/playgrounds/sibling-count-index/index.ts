import type { PlaygroundSection } from '../types';
import { ElementCountingDemo } from './element-counting-demo';
import { SiblingCountBarsDemo } from './sibling-count-bars-demo';
import { SiblingIndexStaggerDemo } from './sibling-index-stagger-demo';

export const siblingCountIndexSection: PlaygroundSection = {
  id: 'sibling-count-index',
  title: 'sibling-index() / sibling-count()',
  description:
    '要素の並び順と兄弟要素の総数を<integer>として返すCSSの関数です。並び順に応じたアニメーションの遅延や、項目数から逆算するレイアウトをCSSだけで書けます。',
  category: 'css',
  type: 'blog',
  slug: 'sibling-count-index',
  demos: [
    {
      component: ElementCountingDemo,
      title: '何が番号を消費するか',
      description:
        'style、script、display:noneの項目を含むリストに、sibling-index()の値を表示しています。画面に出ない要素も番号を消費するので、見えている番号が飛びます。',
    },
    {
      component: SiblingIndexStaggerDemo,
      title: 'sibling-index()で順番にフェードインさせる',
      description:
        'animation-delayをsibling-index()から計算しています。項目数を変えても、インラインのstyleで番号を配り直すことなく遅延が付き直します。',
    },
    {
      component: SiblingCountBarsDemo,
      title: 'sibling-count()とsibling-index()に追従するバー',
      description:
        '幅をsibling-count()で等分し、高さをsibling-index()から決めています。先頭に項目を追加すると、後続の番号が繰り上がって高さが変わります。',
    },
  ],
};
