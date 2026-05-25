import type { PlaygroundSection } from '../types';
import { ContainerStyleQueriesDemo } from './container-style-queries-demo';

export { ContainerStyleQueriesDemo } from './container-style-queries-demo';

export const containerStyleQueriesSection: PlaygroundSection = {
  id: 'container-style-queries',
  title: 'Container style queries',
  description:
    '@container style()で祖先要素のカスタムプロパティの値を条件にスタイルを切り替えるCSSの仕組みです。テーマやコンテキストごとのスタイル分岐を子要素側で完結できます。',
  type: 'blog',
  slug: 'container-style-queries',
  demos: [
    {
      component: ContainerStyleQueriesDemo,
      title: 'Container style queriesで親のテーマに追従するカード',
    },
  ],
};
