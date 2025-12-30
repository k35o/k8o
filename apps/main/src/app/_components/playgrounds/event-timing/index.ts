import type { PlaygroundSection } from '../types';
import { EventTimingDemo } from './event-timing-demo';

export { EventTimingDemo } from './event-timing-demo';

export const eventTimingSection: PlaygroundSection = {
  id: 'event-timing',
  title: 'Event Timing',
  description:
    'ユーザー操作によって発生したイベントの待ち時間を計測するAPIです。',
  type: 'blog',
  slug: 'event-timing',
  demos: [
    {
      component: EventTimingDemo,
      title: 'イベントタイミング計測',
    },
  ],
};
