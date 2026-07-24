import rehypeShiki from '@shikijs/rehype';

import { annotateTransformer } from './transformer.ts';

// ライトは one-light、ダークは従来の plastic。インラインstyleにはライト色を出し、
// ダーク側は annotate.css の .dark ルールが --shiki-dark 変数で上書きする
const rehypeCodeHighlight: typeof rehypeShiki = function () {
  return rehypeShiki.call(this, {
    themes: {
      dark: 'plastic',
      light: 'one-light',
    },
    defaultColor: 'light',
    transformers: [annotateTransformer()],
  });
};

export default rehypeCodeHighlight;
