import type { PlaygroundSection } from '../types';
import { ContainerStyleQueriesDemo } from './container-style-queries-demo';

export const containerStyleQueriesSection: PlaygroundSection = {
  id: 'container-style-queries',
  title: 'Container style queries',
  description:
    '@container style()で祖先要素のカスタムプロパティの値を条件にスタイルを切り替えるCSSの仕組みです。テーマやコンテキストごとのスタイル分岐を子要素側で完結できます。',
  category: 'css',
  type: 'blog',
  slug: 'container-style-queries',
  demos: [
    {
      component: ContainerStyleQueriesDemo,
      title: '名前を付けたクエリと付けないクエリの比較',
      description:
        '親と途中の要素の--csq-themeを切り替えて、名前を付けたクエリと付けないクエリが、どちらの値を見るかを比べられます。',
    },
  ],
};
