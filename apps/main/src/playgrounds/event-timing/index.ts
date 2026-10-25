import type { PlaygroundSection } from '../types';
import { EventTimingDemo } from './event-timing-demo';

export const eventTimingSection: PlaygroundSection = {
  id: 'event-timing',
  title: 'Event Timing',
  description:
    'ユーザー操作によって発生したイベントの待ち時間を計測するAPIです。',
  category: 'performance',
  type: 'blog',
  slug: 'event-timing',
  demos: [
    {
      component: EventTimingDemo,
      title: 'イベントタイミング計測',
      description:
        '約50msの重い処理を行うボタンをクリックすると、遅延を入力遅延・処理時間・描画遅延に分解してバーで可視化します。',
    },
  ],
};
