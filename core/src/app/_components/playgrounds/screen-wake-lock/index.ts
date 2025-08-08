import type { PlaygroundSection } from '../types';
import { WakeLockDemo } from './wake-lock-demo';

export { WakeLockDemo } from './wake-lock-demo';

export const screenWakeLockSection: PlaygroundSection = {
  id: 'screen-wake-lock',
  title: 'Screen Wake Lock API',
  description:
    'デバイスのスクリーンが自動的にスリープ状態になることを防ぐAPIです。',
  type: 'blog',
  slug: 'screen-wake-lock',
  demos: [{ component: WakeLockDemo, title: 'スクリーンスリープ防止' }],
};
