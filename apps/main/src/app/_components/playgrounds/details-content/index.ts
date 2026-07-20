import type { PlaygroundSection } from '../types';
import { DetailsAnimationDemo } from './details-animation-demo';
import { DetailsContentDemo } from './details-content-demo';

export const detailsContentSection: PlaygroundSection = {
  id: 'details-content',
  title: '::details-content擬似要素',
  description:
    'details要素の開閉時にスムーズなアニメーションをCSSだけで実装できる擬似要素です。',
  category: 'css',
  type: 'blog',
  slug: 'details-content',
  demos: [
    {
      component: DetailsContentDemo,
      title: 'スタイリング例',
      description:
        '同じ破線ボーダーを、summary以外の子要素すべてに当てる方法と::details-contentに1回当てる方法で比較します。',
    },
    {
      component: DetailsAnimationDemo,
      title: 'アニメーション実装パターン',
      description:
        'interpolate-sizeとheightのtransitionを::details-contentに指定し、JSなしで開閉をなめらかに動かします。',
    },
  ],
};
