import type { MDXContent } from 'mdx/types';
import { createElement } from 'react';
import { expect, userEvent } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { MdxContent } from './mdx-base';

import styles from './mdx-base.stories.module.css';

// コンパイルした MDX と同じく、`##` を components の h2 で描く
const Article: MDXContent = ({ components }) => {
  const H2 = components?.['h2'];
  if (typeof H2 !== 'function') {
    throw new TypeError('h2 の部品がありません');
  }
  return <H2>はじめに</H2>;
};

const TERMS = Array.from({ length: 60 }, (_, index) => String(index + 1));

// rehype-math が描く別行の数式（Temml の MathML を、tabindex を付けたスクロールの箱で包んだもの）と同じ形にする。
// JSX には MathML の要素の型が無いので、createElement で作る
const MathArticle: MDXContent = () => (
  // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- rehype-math と同じく、横にスクロールする箱をキーボードで届かせる
  <div className="math-scroll" tabIndex={0}>
    {createElement(
      'math',
      {
        display: 'block',
        className: 'tml-display',
        style: { display: 'block math' },
      },
      createElement(
        'mrow',
        null,
        TERMS.flatMap((term, index) => {
          const number = createElement('mn', { key: term }, term);
          return index === 0
            ? [number]
            : [createElement('mo', { key: `+${term}` }, '+'), number];
        }),
      ),
    )}
  </div>
);

// 記事の MDX に手で書いた別行の MathML
const HandwrittenBlockMathArticle: MDXContent = () => (
  <div data-testid="frame">
    {createElement(
      'math',
      { display: 'block' },
      createElement('msup', null, [
        createElement('mi', { key: 'base' }, 'x'),
        createElement('mn', { key: 'exponent' }, '2'),
      ]),
    )}
  </div>
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
    const display = canvasElement.querySelector('.math-scroll');
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

// 正常系: 数式の CSS を読んでも、記事に手で書いた display="block" の math は行の中に入らず、枠の幅いっぱいの箱になる
export const HandwrittenBlockMath = meta.story({
  args: { Content: HandwrittenBlockMathArticle },
  play: async ({ canvas }) => {
    const frame = canvas.getByTestId('frame');
    const math = frame.querySelector('math');
    if (math === null) {
      throw new TypeError('math 要素がありません');
    }

    await expect(math.getBoundingClientRect().width).toBe(
      frame.getBoundingClientRect().width,
    );
  },
});
