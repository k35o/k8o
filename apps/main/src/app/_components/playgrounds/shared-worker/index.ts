import type { PlaygroundSection } from '../types';
import { SharedWorkerDemo } from './shared-worker-demo';

export { SharedWorkerDemo } from './shared-worker-demo';

export const sharedWorkerSection: PlaygroundSection = {
  id: 'shared-worker',
  title: 'SharedWorker',
  description:
    '同一オリジンの複数タブから共有できるWorkerです。タブをまたいで状態を共有できます。',
  type: 'blog',
  slug: 'shared-worker',
  demos: [
    {
      component: SharedWorkerDemo,
      title: 'タブ間カウンタ',
    },
  ],
};
