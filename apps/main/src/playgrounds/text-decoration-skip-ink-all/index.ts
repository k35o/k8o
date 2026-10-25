import type { PlaygroundSection } from '../types';
import { TextDecorationSkipInkDemo } from './text-decoration-skip-ink-demo';

export const textDecorationSkipInkAllSection: PlaygroundSection = {
  id: 'text-decoration-skip-ink-all',
  title: 'text-decoration-skip-ink: all',
  description:
    'allの値で下線・上線がすべてのグリフのインクと交差する箇所で必ず途切れます。CJK文字でも下線が突き刺さらず、読みやすくなります。',
  category: 'css',
  type: 'blog',
  slug: 'text-decoration-skip-ink-all',
  demos: [
    {
      component: TextDecorationSkipInkDemo,
      title: 'skip-ink値の比較',
      description:
        'auto・none・allをSelectで切り替え、漢字や「ぐ」「ゆ」の下端で下線がどう途切れるか確かめられます。',
    },
  ],
};
