import type { PlaygroundSection } from '../types';
import { ToggleEventSourceDemo } from './toggleevent-source-demo';

export const toggleEventSourceSection: PlaygroundSection = {
  id: 'toggleevent-source',
  title: 'ToggleEvent.source',
  description:
    'toggle / beforetoggleイベントに発火元の要素を載せて渡すプロパティです。複数トリガーから共有のポップオーバーを開くケースで、どのボタンから開かれたかを判定できます。',
  category: 'js-api',
  type: 'blog',
  slug: 'toggleevent-source',
  demos: [
    {
      component: ToggleEventSourceDemo,
      title: 'event.sourceで発火元のボタンを取得',
      description:
        '3人分の詳細ボタンが1つのポップオーバーを共有し、event.sourceのdata-member-idで表示するメンバーを切り替えます。',
    },
  ],
};
