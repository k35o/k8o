import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Image } from './image';

describe('Image', () => {
  describe('正常系', () => {
    it('画像を描き、head に preload を書かせない', () => {
      const html = renderToStaticMarkup(
        <Image
          alt="k8oのアイコン"
          height={512}
          src="/slides/sample-deck-k8o.avif"
          width={512}
        />,
      );

      expect(html).toContain('src="/slides/sample-deck-k8o.avif"');
      expect(html).not.toContain('rel="preload"');
    });
  });
});
