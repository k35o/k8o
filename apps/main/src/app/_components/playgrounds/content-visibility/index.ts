import type { PlaygroundSection } from '../types';
import { ContentVisibilityDemo } from './content-visibility-demo';

export const contentVisibilitySection: PlaygroundSection = {
  id: 'content-visibility',
  title: 'content-visibility',
  description:
    '要素のレンダリングを制御しパフォーマンスを向上させるCSSプロパティです。',
  category: 'css',
  type: 'blog',
  slug: 'content-visibility',
  demos: [
    {
      component: ContentVisibilityDemo,
      title: 'hiddenとautoの違い',
      description:
        'hiddenとautoを適用した2枚のカードをボタンでvisibleに切り替え、描画やアクセシビリティの違いを比較できます。',
    },
  ],
};
