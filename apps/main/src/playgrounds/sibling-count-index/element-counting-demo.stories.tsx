import { expect, userEvent } from 'storybook/test';

import preview from '../../../.storybook/preview';
import { Playground } from '../playground';
import { ElementCountingDemo } from './element-counting-demo';

const playgroundTitle = ElementCountingDemo.name;

const meta = preview.meta({
  title: 'playgrounds/sibling-count-index/ElementCountingDemo',
  component: ElementCountingDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();

// 正常系: style・display: none の要素・script も兄弟として数え、スイッチを入れると script は 6 番目に出る
export const CountsHiddenSiblings = meta.story({
  play: async ({ canvas, canvasElement }) => {
    const nodes = [
      ...canvasElement.querySelectorAll<HTMLElement>('.scid-node'),
    ];
    await expect(
      nodes.map((node) => getComputedStyle(node).counterReset),
    ).toStrictEqual(
      ['1', '2', '3', '4', '5', '6', '7'].map((index) => `scid-index ${index}`),
    );

    await userEvent.click(
      canvas.getByRole('switch', { name: '画面に出ない子要素も表示する' }),
    );

    const script = nodes[5];
    await expect(script?.tagName).toBe('SCRIPT');
    // ページの CSP は inline の script を拒むので、実行しない type にしてある
    await expect(script).toHaveAttribute('type', 'text/plain');
    await expect(script).toBeVisible();
    await expect(script).toHaveTextContent('/* 計測用 */');
  },
});

const commentsIn = (tree: Element | null): string[] =>
  [...(tree?.childNodes ?? [])]
    .filter((node) => node instanceof Comment)
    .map((node) => node.data.trim());

const textsIn = (tree: Element | null): string[] =>
  [...(tree?.childNodes ?? [])]
    .filter((node) => node instanceof Text)
    .map((node) => node.data.trim())
    .filter((text) => text !== '');

// 正常系: コメントとテキストノードは番号を消費せず、スイッチを入れるとコメントの中身が文字で出る
export const SkipsCommentsAndTextNodes = meta.story({
  play: async ({ canvas, canvasElement }) => {
    const tree = canvasElement.querySelector('.scid-tree');
    await expect(commentsIn(tree)).toStrictEqual(['コメント']);
    await expect(textsIn(tree)).toStrictEqual(['テキストノード']);
    await expect(
      [...canvasElement.querySelectorAll('.scid-node')].map(
        (node) => getComputedStyle(node).counterReset,
      ),
    ).toStrictEqual(
      ['1', '2', '3', '4', '5', '6', '7'].map((index) => `scid-index ${index}`),
    );

    const toggle = canvas.getByRole('switch', {
      name: '画面に出ない子要素も表示する',
    });
    await userEvent.click(toggle);
    await expect(textsIn(tree)).toStrictEqual([
      '<!-- コメント -->',
      'テキストノード',
    ]);

    await userEvent.click(toggle);
    await expect(textsIn(tree)).toStrictEqual(['テキストノード']);
  },
});
