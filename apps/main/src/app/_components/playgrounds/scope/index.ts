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
  type: 'blog',
  slug: 'scope',
  demos: [
    {
      component: DonutScopeDemo,
      title: 'ドーナツスコープ',
    },
    {
      component: ScopeLimitDemo,
      title: ':scopeを使ったスコープリミット',
    },
    {
      component: ScopeProximityDemo,
      title: 'スコープの近接性',
    },
  ],
};
