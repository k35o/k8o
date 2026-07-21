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
      title: 'Container style queriesで親のテーマに追従するカード',
      description:
        'ラジオで親の--csq-themeを切り替えると、途中のラッパーが値を上書きしていても名指しした親の値でカードの配色が変わる様子を確認できます。',
    },
  ],
};
