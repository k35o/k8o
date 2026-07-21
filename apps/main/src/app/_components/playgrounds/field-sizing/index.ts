import type { PlaygroundSection } from '../types';
import { FieldSizingDemo } from './field-sizing-demo';

export const fieldSizingSection: PlaygroundSection = {
  id: 'field-sizing',
  title: 'field-sizing',
  description:
    'field-sizing: contentでフォームコントロールを入力内容に合わせて伸縮させられます。',
  category: 'css',
  type: 'blog',
  slug: 'field-sizing',
  demos: [
    {
      component: FieldSizingDemo,
      title: 'field-sizing: contentの挙動',
      description:
        'contentとfixedを切り替えて、input・textarea・selectの伸縮を比較できます。空のinputはプレースホルダー幅になります。',
    },
  ],
};
