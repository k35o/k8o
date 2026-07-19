import type { PlaygroundSection } from '../types';
import { CssMathFunctionsDemo } from './css-math-functions-demo';

export { CssMathFunctionsDemo } from './css-math-functions-demo';

export const absSignSection: PlaygroundSection = {
  id: 'abs-sign',
  title: 'CSS abs()とsign()関数',
  description: '数値の絶対値と符号を取得するCSS関数です。',
  category: 'css',
  type: 'blog',
  slug: 'abs-sign',
  demos: [
    {
      component: CssMathFunctionsDemo,
      title: 'CSS数学関数デモ',
      description:
        'スライダーで座標を動かすと、abs()が点の大きさと透明度を、sign()が色相を決めます。原点から離れるほど点が大きく濃くなります。',
    },
  ],
};
