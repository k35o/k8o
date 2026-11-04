import type { MDXContent } from 'mdx/types';
import { expect, userEvent } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { MdxContent } from './mdx-base';

import styles from './mdx-base.stories.module.css';
// アプリでは数式を使う記事が読み込むため、Storybook では Story 側で読み込む
import '@repo/mdx-preset/katex.css';

// コンパイルした MDX と同じく、`##` を components の h2 で描く
const Article: MDXContent = ({ components }) => {
  const H2 = components?.['h2'];
  if (typeof H2 !== 'function') {
    throw new TypeError('h2 の部品がありません');
  }
  return <H2>はじめに</H2>;
};

const TERMS = Array.from({ length: 60 }, (_, index) => String(index + 1));

// rehype-math が描く別行の数式（KaTeX の HTML の箱に tabindex を足したもの）と同じ入れ子と class にする。
// JSX には MathML の型が無いので、読み上げ用の MathML は式の文字で代える
const MathArticle: MDXContent = () => (
  // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- rehype-math と同じく、横にスクロールする箱をキーボードで届かせる
  <span className="katex-display" tabIndex={0}>
    <span className="katex">
      <span className="katex-mathml">{TERMS.join(' + ')}</span>
      <span aria-hidden="true" className="katex-html">
        {TERMS.map((term, index) => (
          <span className="katex-base" key={term}>
            <span className="mord">{term}</span>
            {index < TERMS.length - 1 && (
              <>
                <span className="mspace" style={{ marginRight: '0.2222em' }} />
                <span className="mbin">+</span>
                <span className="mspace" style={{ marginRight: '0.2222em' }} />
              </>
            )}
          </span>
        ))}
      </span>
    </span>
  </span>
);

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

// 正常系: 狭い枠でも、長い別行の数式は数式の箱の中で横にスクロールし、ページを横にはみ出させない。
// 箱は Tab で止まる
export const LongDisplayMath = meta.story({
  args: { Content: MathArticle },
  decorators: [
    (Story) => (
      <div className={styles.narrow}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const display = canvasElement.querySelector('.katex-display');
    if (!(display instanceof HTMLElement)) {
      throw new TypeError('別行の数式がありません');
    }
    const page = document.documentElement;

    await expect(page.scrollWidth).toBeLessThanOrEqual(page.clientWidth);
    await expect(display.scrollWidth).toBeGreaterThan(display.clientWidth);
    display.scrollLeft = display.scrollWidth;
    await expect(display.scrollLeft).toBeGreaterThan(0);
    display.scrollLeft = 0;

    await userEvent.tab();
    await expect(display).toHaveFocus();
  },
});
