import type { PlaygroundSection } from '../types';
import { DonutScopeDemo } from './donut-scope-demo';
import { ScopeLimitDemo } from './scope-limit-demo';
import { ScopeProximityDemo } from './scope-proximity-demo';

export { DonutScopeDemo } from './donut-scope-demo';
export { ScopeLimitDemo } from './scope-limit-demo';
export { ScopeProximityDemo } from './scope-proximity-demo';

export const scopeSection: PlaygroundSection = {
  id: 'scope',
  title: '@scope',
  description:
    'CSSスタイルの適用範囲を特定のDOM部分木に限定できるアットルールです。',
  category: 'css',
  type: 'blog',
  slug: 'scope',
  demos: [
    {
      component: DonutScopeDemo,
      title: 'ドーナツスコープ',
      description:
        'to句でスコープに下限を設け、ネストされた領域の画像だけを枠線の適用から除外します。通常のセレクタと切り替えて比較できます。',
    },
    {
      component: ScopeLimitDemo,
      title: ':scopeを使ったスコープリミット',
      description:
        '下限に:scope >を使うと直接の子だけが除外され、孫要素の同名クラスにはスタイルが当たり続ける様子を比較できます。',
    },
    {
      component: ScopeProximityDemo,
      title: 'スコープの近接性',
      description:
        '入れ子のボックスで、定義順ではなくスコープルートへの近さで勝敗が決まる近接性を、通常のカスケードと切り替えて確認できます。',
    },
  ],
};
