import type { PlaygroundSection } from '../types';
import { FontFamilyMathDemo } from './font-family-math-demo';

export { FontFamilyMathDemo } from './font-family-math-demo';

export const fontFamilyMathSection: PlaygroundSection = {
  id: 'font-family-math',
  title: 'font-family: math',
  description:
    '数学的表現に特化したgeneric font familyで、数式を適切に表示します。',
  type: 'blog',
  slug: 'font-family-math',
  demos: [
    {
      component: FontFamilyMathDemo,
      title: 'font-family: mathプロパティ',
    },
  ],
};
