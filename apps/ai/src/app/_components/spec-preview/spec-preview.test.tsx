import type { UISpec } from '@k8ordo/ui/json-render';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { SpecPreview } from './spec-preview';

const LINK_SPEC = {
  root: 'more',
  elements: {
    more: {
      type: 'Anchor',
      props: { label: '詳しく見る', href: 'https://example.com/?d=1' },
    },
  },
} satisfies UISpec;

describe('SpecPreview', () => {
  describe('エッジケース', () => {
    it('サーバーで描いた HTML では、ハイドレーションまでリンクを押せないよう根を inert にする', () => {
      const html = renderToString(<SpecPreview spec={LINK_SPEC} />);

      const rootTag = html.slice(0, html.indexOf('>') + 1);
      expect(rootTag).toMatch(/^<div [^>]*\binert=""/u);
      expect(html).toContain('href="https://example.com/?d=1"');
    });
  });
});
