import { Button, Textarea, TextField } from '@k8ordo/ui';
import { expect, waitFor, within } from 'storybook/test';

import { buildDemoDocument } from '@/features/blog/application/demo-document';

import preview from '../../../../.storybook/preview';

// 記事の例の iframe は origin を持たず中を外から読めないので、同じ文書を allow-same-origin だけの
// sandbox の iframe に入れて読む（例の script は比べるのに要らないので止めたまま）
const demoDocument = buildDemoDocument({
  name: 'base-style',
  html: [
    '<button type="button">押す</button>',
    '<input aria-label="文字" type="text" value="文字">',
    '<input aria-label="読むだけ" type="text" value="読むだけ" readonly>',
    '<input aria-label="使えない" type="text" value="使えない" disabled>',
    '<select aria-label="選ぶ"><option>選ぶ</option></select>',
    '<textarea aria-label="文字の欄">文字</textarea>',
  ].join('\n'),
  css: '',
  script: '',
});

const BOX = [
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border-top-width',
  'border-top-style',
  'border-top-color',
  'border-top-left-radius',
  'background-color',
] as const;

const BUTTON = [...BOX, 'color', 'font-size', 'line-height', 'font-weight'];

const SELECT_BOX = [
  'padding-top',
  'padding-bottom',
  'border-top-width',
  'border-top-style',
  'border-top-color',
  'border-top-left-radius',
  'background-color',
];

const STATE = ['background-color', 'border-top-color', 'cursor'];

const FOCUS_RING = ['box-shadow', 'outline-style', 'border-top-color'];

const styleOf = (
  element: Element | null,
  properties: readonly string[],
): Record<string, string> => {
  if (element === null) throw new Error('比べる要素が無い');
  const style = getComputedStyle(element);
  return Object.fromEntries(
    properties.map((property) => [property, style.getPropertyValue(property)]),
  );
};

const meta = preview.meta({
  title: 'app/blog/code-demo/base-style',
  render: () => (
    <div>
      <Button color="base" size="md" variant="solid">
        押す
      </Button>
      <TextField aria-label="文字" defaultValue="文字" id="base-style-text" />
      <TextField
        aria-label="読むだけ"
        defaultValue="読むだけ"
        id="base-style-readonly"
        readOnly
      />
      <TextField
        aria-label="使えない"
        defaultValue="使えない"
        disabled
        id="base-style-disabled"
      />
      <Textarea
        aria-label="文字の欄"
        defaultValue="文字"
        id="base-style-textarea"
      />
      <iframe
        sandbox="allow-same-origin"
        srcDoc={demoDocument}
        title="例の下地"
      />
    </div>
  ),
});

const compareWithUi =
  (theme: 'light' | 'dark') =>
  async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
    const canvas = within(canvasElement);
    const frame = canvas.getByTitle<HTMLIFrameElement>('例の下地');
    await waitFor(async () => {
      await expect(
        frame.contentDocument?.querySelector('textarea')?.tagName,
      ).toBe('TEXTAREA');
    });
    const demo = frame.contentDocument ?? document;
    demo.documentElement.style.colorScheme = theme;
    await Promise.all(
      demo.getAnimations().map(async ({ finished }) => finished),
    );
    const ui = (id: string): HTMLElement | null =>
      canvasElement.querySelector(`#${id}`);
    const demoInput = demo.querySelector<HTMLInputElement>(
      'input:not([readonly], [disabled])',
    );

    await expect(styleOf(demo.querySelector('button'), BUTTON)).toStrictEqual(
      styleOf(canvas.getByRole('button', { name: '押す' }), BUTTON),
    );
    await expect(styleOf(demoInput, BOX)).toStrictEqual(
      styleOf(ui('base-style-text'), BOX),
    );
    await expect(styleOf(demo.querySelector('textarea'), BOX)).toStrictEqual(
      styleOf(ui('base-style-textarea'), BOX),
    );
    await expect(
      styleOf(demo.querySelector('select'), SELECT_BOX),
    ).toStrictEqual(styleOf(ui('base-style-text'), SELECT_BOX));
    await expect(
      styleOf(demo.querySelector('input[readonly]'), STATE),
    ).toStrictEqual(styleOf(ui('base-style-readonly'), STATE));
    await expect(
      styleOf(demo.querySelector('input[disabled]'), STATE),
    ).toStrictEqual(styleOf(ui('base-style-disabled'), STATE));

    ui('base-style-text')?.focus();
    const uiRing = styleOf(ui('base-style-text'), FOCUS_RING);
    demoInput?.focus();
    await expect(styleOf(demoInput, FOCUS_RING)).toStrictEqual(uiRing);
  };

export const Light = meta.story({
  parameters: { theme: 'light' },
  play: compareWithUi('light'),
});

export const Dark = meta.story({
  parameters: { theme: 'dark' },
  play: compareWithUi('dark'),
});
