import type { PlaygroundSection } from '../types';
import { TextDecorationSkipInkDemo } from './text-decoration-skip-ink-demo';

export const textDecorationSkipInkAllSection: PlaygroundSection = {
  id: 'text-decoration-skip-ink-all',
  title: 'text-decoration-skip-ink: all',
  description:
    'auto、none、allで、下線が文字と重なる箇所の途切れ方を比べられます。',
  category: 'css',
  type: 'blog',
  slug: 'text-decoration-skip-ink-all',
  demos: [
    {
      component: TextDecorationSkipInkDemo,
      title: 'skip-ink値の比較',
      description:
        'auto、none、allを切り替えて、漢字やかなの下で下線がどう途切れるかを確かめられます。',
    },
  ],
};
