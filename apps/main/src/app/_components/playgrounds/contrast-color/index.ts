import type { PlaygroundSection } from '../types';
import { ContrastColorDemo } from './contrast-color-demo';

export { ContrastColorDemo } from './contrast-color-demo';

export const contrastColorSection: PlaygroundSection = {
  id: 'contrast-color',
  title: 'contrast-color',
  description:
    '背景色に対してコントラストの高い色（黒または白）を自動で返すCSS関数です。',
  type: 'blog',
  slug: 'contrast-color',
  demos: [
    {
      component: ContrastColorDemo,
      title: 'contrast-color()のデモ',
    },
  ],
};
