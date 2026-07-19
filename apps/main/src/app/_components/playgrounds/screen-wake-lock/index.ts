import type { PlaygroundSection } from '../types';
import { WakeLockDemo } from './wake-lock-demo';

export { WakeLockDemo } from './wake-lock-demo';

export const screenWakeLockSection: PlaygroundSection = {
  id: 'screen-wake-lock',
  title: 'Screen Wake Lock API',
  description:
    'デバイスのスクリーンが自動的にスリープ状態になることを防ぐAPIです。',
  category: 'js-api',
  type: 'blog',
  slug: 'screen-wake-lock',
  demos: [
    {
      component: WakeLockDemo,
      title: 'スクリーンスリープ防止',
      description:
        'ボタンでWake Lockの取得と解放を切り替えます。タブを離れるとロックは自動解除され、ボタンの表示も追従します。',
    },
  ],
};
