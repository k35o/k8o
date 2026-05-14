import rehypeShiki from '@shikijs/rehype';

import { annotateTransformer } from './transformer.ts';

const rehypeCodeHighlight: typeof rehypeShiki = function () {
  return rehypeShiki.call(this, {
    theme: 'plastic',
    transformers: [annotateTransformer()],
  });
};

export default rehypeCodeHighlight;
