import type { PlaygroundSection } from '../types';
import { ExtTextureNorm16Demo } from './ext-texture-norm16-demo';

export const extTextureNorm16Section: PlaygroundSection = {
  id: 'ext-texture-norm16',
  title: 'EXT_texture_norm16',
  description:
    'WebGL 2に16bitの正規化形式のテクスチャを足す拡張です。符号なしの16bitの整数を、シェーダーでは0.0〜1.0の小数として線形補間付きで読めます。',
  category: 'js-api',
  type: 'blog',
  slug: 'ext-texture-norm16',
  demos: [
    {
      component: ExtTextureNorm16Demo,
      title: '同じ16bitの高さデータを3つの形式で比べる',
      description:
        '起伏の小さい16bitの高さデータを、R8・R16F・R16_EXTのテクスチャにそれぞれ入れ、くぼみの底を黒、丘のてっぺんを白にして描きます。R8とR16Fでは値が丸められて段差が現れ、R16_EXTだけが滑らかなまま残ります。',
    },
  ],
};
