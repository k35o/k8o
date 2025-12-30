import type { PlaygroundSection } from '../types';
import { LCPDemo } from './lcp-demo';

export { LCPDemo } from './lcp-demo';

export const lcpSection: PlaygroundSection = {
  id: 'largest-contentful-paint',
  title: 'Largest Contentful Paint',
  description:
    'ビューポート内で最も大きなコンテンツ要素が描画されるまでの時間を計測するAPIです。',
  type: 'blog',
  slug: 'largest-contentful-paint',
  demos: [
    {
      component: LCPDemo,
      title: 'LCP計測',
    },
  ],
};
