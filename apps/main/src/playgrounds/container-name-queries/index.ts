import type { PlaygroundSection } from '../types';
import { ContainerNameDemo } from './container-name-demo';

export const containerNameQueriesSection: PlaygroundSection = {
  id: 'container-name-queries',
  title: 'Name-only container queries',
  description:
    '@containerに名前だけを書き、その名前のコンテナの中にある要素へスタイルを当てるCSSの書き方です。',
  category: 'css',
  type: 'blog',
  slug: 'container-name-queries',
  demos: [
    {
      component: ContainerNameDemo,
      title: 'コンテナの名前でカードのレイアウトを切り替える',
      description:
        '親のcontainer-nameをラジオで切り替えると、中のカードに当たる@containerのブロックが変わる様子を確認できます。',
    },
  ],
};
