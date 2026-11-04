import type { MDXContent } from 'mdx/types';
import { expect } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { MdxContent } from './mdx-base';

// コンパイルした MDX と同じく、`##` を components の h2 で描く
const Article: MDXContent = ({ components }) => {
  const H2 = components?.['h2'];
  if (typeof H2 !== 'function') {
    throw new TypeError('h2 の部品がありません');
  }
  return <H2>はじめに</H2>;
};

const meta = preview.meta({
  title: 'app/globals/mdx-base',
  component: MdxContent,
  args: {
    Content: Article,
    components: {},
  },
});

// 正常系: 見出しの横のアンカーは、キーボードの順と同じく読み上げからも外す
export const HeadingAnchor = meta.story({
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 3, name: 'はじめに' }),
    ).toHaveAttribute('id', 'はじめに');
    await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
    await expect(canvas.getByRole('link', { hidden: true })).toHaveAttribute(
      'href',
      `#${encodeURIComponent('はじめに')}`,
    );
  },
});
