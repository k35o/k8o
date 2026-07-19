import type { PlaygroundSection } from '../types';
import { LCPDemo } from './lcp-demo';

export { LCPDemo } from './lcp-demo';

export const lcpSection: PlaygroundSection = {
  id: 'largest-contentful-paint',
  title: 'Largest Contentful Paint',
  description:
    'ビューポート内で最も大きなコンテンツ要素が描画されるまでの時間を計測するAPIです。',
  category: 'performance',
  type: 'blog',
  slug: 'largest-contentful-paint',
  demos: [
    {
      component: LCPDemo,
      title: 'LCP計測',
      description:
        'このページ自身のLCP候補をbuffered付きで捕捉し、startTimeやsize、対象要素の変遷を確認できます。',
    },
  ],
};
