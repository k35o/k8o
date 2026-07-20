import type { PlaygroundSection } from '../types';
import { ActiveViewTransitionDemo } from './active-view-transition-demo';

export const activeViewTransitionSection: PlaygroundSection = {
  id: 'active-view-transition',
  title: ':active-view-transition-type()疑似クラス',
  description:
    'View Transitionの遷移タイプに応じて、異なるアニメーションを適用します。',
  category: 'css',
  type: 'blog',
  slug: 'active-view-transition',
  demos: [
    {
      component: ActiveViewTransitionDemo,
      title: 'タイプ別アニメーション',
      description:
        '進む・戻るで遷移タイプが切り替わり、弾けて散る・集まるという別々のアニメーションになります。左上の丸は遷移中だけ点灯します。',
    },
  ],
};
