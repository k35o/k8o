import type { PlaygroundSection } from '../types';
import { CrispEdgesDemo } from './crisp-edges-demo';

export { CrispEdgesDemo } from './crisp-edges-demo';

export const crispEdgesSection: PlaygroundSection = {
  id: 'crisp-edges',
  title: 'image-rendering: crisp-edges',
  description:
    '画像を拡大表示するときに色を補間せず境界をはっきり保つCSS値です。ドット絵やピクセルアートを滲ませずに拡大できます。',
  type: 'blog',
  slug: 'crisp-edges',
  demos: [
    {
      component: CrispEdgesDemo,
      title: 'image-rendering値の比較',
    },
  ],
};
