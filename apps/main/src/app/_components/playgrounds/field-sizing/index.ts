import type { PlaygroundSection } from '../types';
import { FieldSizingDemo } from './field-sizing-demo';

export { FieldSizingDemo } from './field-sizing-demo';

export const fieldSizingSection: PlaygroundSection = {
  id: 'field-sizing',
  title: 'field-sizing',
  description:
    'field-sizing: contentでフォームコントロールを入力内容に合わせて伸縮させられます。',
  type: 'blog',
  slug: 'field-sizing',
  demos: [
    {
      component: FieldSizingDemo,
      title: 'field-sizing: contentの挙動',
    },
  ],
};
