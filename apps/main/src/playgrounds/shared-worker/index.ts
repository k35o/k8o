import type { PlaygroundSection } from '../types';
import { SharedWorkerDemo } from './shared-worker-demo';

export const sharedWorkerSection: PlaygroundSection = {
  id: 'shared-worker',
  title: 'SharedWorker',
  description:
    '同一オリジンの複数タブから共有できるWorkerです。タブをまたいで状態を共有できます。',
  category: 'js-api',
  type: 'blog',
  slug: 'shared-worker',
  demos: [
    {
      component: SharedWorkerDemo,
      title: 'タブ間カウンタ',
      description:
        '別タブで開くとWorker起動時刻が一致し、+1が全タブに同期します。接続中のタブ数も表示します。',
    },
  ],
};
