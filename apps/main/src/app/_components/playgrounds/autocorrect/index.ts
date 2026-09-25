import type { PlaygroundSection } from '../types';
import { AttributeReflectionDemo } from './attribute-reflection-demo';

export const autocorrectSection: PlaygroundSection = {
  id: 'autocorrect',
  title: 'autocorrect',
  description:
    '編集可能な要素でOSやブラウザの自動修正を有効にするかを指定するHTMLのグローバル属性です。',
  category: 'html',
  type: 'blog',
  slug: 'autocorrect',
  demos: [
    {
      component: AttributeReflectionDemo,
      title: '属性の値と反映されるプロパティを見る',
      description:
        'autocorrect属性の値を切り替えて、HTMLElement.autocorrectがどの真偽値を返すかを確認できます。',
    },
  ],
};
