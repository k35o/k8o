import { CODE_SURFACE } from '@repo/code-highlight/theme';
import type { HighlightedCode } from '@repo/code-highlight/tokenize';
import { expect, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { CodeView } from './code-view';

const meta = preview.meta({
  component: CodeView,
});

// shiki を呼ばずに描画経路を検証するための最小フィクスチャ。
const highlightedFixture: HighlightedCode = {
  bg: CODE_SURFACE.bg,
  fg: CODE_SURFACE.fg,
  tokens: [
    [
      { content: 'const', offset: 0, color: '#c792ea' },
      { content: ' x', offset: 5, color: '#a9b2c3' },
      { content: ' =', offset: 7, color: '#a9b2c3' },
      { content: ' 1', offset: 9, color: '#f78c6c' },
      { content: ';', offset: 11, color: '#a9b2c3' },
    ],
  ],
};

export const Empty = meta.story({
  args: { code: null, highlighted: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('ここに生成された TSX が表示されます'),
    ).toBeInTheDocument();
  },
});

export const PlainWhileStreaming = meta.story({
  args: {
    code: 'export default function Preview() {\n  return <div>hello</div>;\n}',
    highlighted: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/export default function Preview/u),
    ).toBeInTheDocument();
  },
});

export const Highlighted = meta.story({
  args: {
    code: 'const x = 1;',
    highlighted: highlightedFixture,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // トークンごとに span 分割されるため、キーワード片で確認する。
    await expect(canvas.getByText('const')).toBeInTheDocument();
  },
});
