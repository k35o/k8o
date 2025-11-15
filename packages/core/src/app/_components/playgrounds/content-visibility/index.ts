import type { PlaygroundSection } from '../types';
import { ContentVisibilityDemo } from './content-visibility-demo';

export { ContentVisibilityDemo } from './content-visibility-demo';

export const contentVisibilitySection: PlaygroundSection = {
  id: 'content-visibility',
  title: 'content-visibility',
  description:
    '要素のレンダリングを制御しパフォーマンスを向上させるCSSプロパティです。',
  type: 'blog',
  slug: 'content-visibility',
  demos: [{ component: ContentVisibilityDemo, title: 'hiddenとautoの違い' }],
};
