import type { PlaygroundSection } from '../types';
import { SchemeImageDemo } from './scheme-image-demo';

export const lightDarkImageSection: PlaygroundSection = {
  id: 'light-dark-image',
  title: 'light-dark() image values',
  description:
    'light-dark()に画像を渡し、要素に適用されたcolor-schemeに応じてグラデーションやurl()を切り替えられます。',
  category: 'css',
  type: 'blog',
  slug: 'light-dark-image',
  demos: [
    {
      component: SchemeImageDemo,
      title: 'color-schemeを切り替えて画像を見る',
      description:
        '枠のcolor-schemeを切り替えると、background-imageに渡した2つのグラデーションが画像ごと入れ替わります。',
    },
  ],
};
