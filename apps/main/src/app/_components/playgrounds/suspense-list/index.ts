import type { PlaygroundSection } from '../types';
import { SuspenseListDemo } from './suspense-list-demo';

export { SuspenseListDemo } from './suspense-list-demo';

export const suspenseListSection: PlaygroundSection = {
  id: 'suspense-list',
  title: 'React SuspenseList',
  description:
    '複数のSuspenseコンポーネントの表示順序や読み込みタイミングを制御します。',
  category: 'react',
  type: 'blog',
  slug: 'suspense-list',
  demos: [
    {
      component: SuspenseListDemo,
      title: 'SuspenseListによる読み込み制御',
      description:
        '読み込み時間の異なる4件のデータでrevealOrderとtailの組み合わせを試します。現在はReact 19.2の制約で機能が無効です。',
    },
  ],
};
