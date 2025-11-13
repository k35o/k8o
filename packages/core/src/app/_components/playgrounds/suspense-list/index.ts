import type { PlaygroundSection } from '../types';
import { SuspenseListDemo } from './suspense-list-demo';

export { SuspenseListDemo } from './suspense-list-demo';

export const suspenseListSection: PlaygroundSection = {
  id: 'suspense-list',
  title: 'React SuspenseList',
  description:
    '複数のSuspenseコンポーネントの表示順序や読み込みタイミングを制御します。',
  type: 'blog',
  slug: 'suspense-list',
  demos: [
    {
      component: SuspenseListDemo,
      title: 'SuspenseListによる読み込み制御',
    },
  ],
};
