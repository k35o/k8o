import type { PlaygroundSection } from '../types';
import { OpenPseudoDemo } from './open-pseudo-demo';

export { OpenPseudoDemo } from './open-pseudo-demo';

export const openPseudoSection: PlaygroundSection = {
  id: 'open-pseudo',
  title: ':open',
  description:
    'dialog、details、select、ピッカー付きのinputが開いている間にマッチするCSS疑似クラスです。要素別の属性セレクタを横断して一本化できます。',
  category: 'css',
  type: 'blog',
  slug: 'open-pseudo',
  demos: [
    {
      component: OpenPseudoDemo,
      title: ':openで開いている要素を一括スタイリング',
      description:
        'details・dialog・select・カラーピッカーを開くと枠線が付きます。ピッカー系は:has(:open)で親の背景色も変わります。',
    },
  ],
};
