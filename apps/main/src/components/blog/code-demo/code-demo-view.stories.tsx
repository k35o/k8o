import { RefreshIcon } from '@k8ordo/ui/icons';
import { expect, waitFor, within } from 'storybook/test';

import { CodeBlock } from '@/components/site/code-block/code-block';
import { CodeGroup } from '@/components/site/code-block/code-group';
import { buildDemoDocument } from '@/features/blog/application/demo-document';

import preview from '../../../../.storybook/preview';
import { CodeDemoView } from './code-demo-view';

// アプリでは mdx-base が読み込むため、Storybook では Story 側で読み込む
import '@repo/code-highlight/styles.css';

// 結果が読み込みの後に動かないよう、アニメーションの無い例にする
const demo = {
  name: 'message',
  html: '<p class="message">HTML のまま</p>',
  css: '.message {\n  color: light-dark(#7c3aed, #a78bfa);\n}',
  script: "document.querySelector('.message').textContent = 'JS が書き換えた';",
};

// Storybook には例の route が無いので、同じ文書を data: の URL で読む
const src = `data:text/html;charset=utf-8,${encodeURIComponent(buildDemoDocument(demo))}`;

// rehype が出力する形に合わせ、data-label を持つ div で pre を包む
const blocks = [
  { lang: 'html', code: demo.html },
  { lang: 'css', code: demo.css },
  { lang: 'js', code: demo.script },
].map(({ lang, code }) => (
  <div className="code-annotate-block" data-label={lang} key={lang}>
    <CodeBlock className="shiki" data-lang={lang}>
      <code>{code}</code>
    </CodeBlock>
  </div>
));

const frameOf = (canvasElement: HTMLElement): HTMLIFrameElement =>
  within(canvasElement).getByTitle<HTMLIFrameElement>('message の結果');

const meta = preview.meta({
  title: 'app/blog/code-demo',
  component: CodeDemoView,
  args: {
    name: demo.name,
    src,
    replayIcon: <RefreshIcon size="sm" />,
    children: <CodeGroup>{blocks}</CodeGroup>,
  },
  // iframe の中は記事の例で、sandbox の中に axe は入れない。問い合わせたままやり直しで frame を
  // 作り直すと、axe の frame への問い合わせが落ちる
  parameters: { a11y: { options: { iframes: false } } },
});

export const Primary = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getAllByRole('tab').map((tab) => tab.textContent),
    ).toStrictEqual(['html', 'css', 'js']);
    await expect(canvas.getByText('結果')).toBeVisible();
    const frame = frameOf(canvasElement);
    await expect(frame).toHaveAttribute('sandbox', 'allow-scripts');
    await expect(frame).toHaveAttribute('src', src);
  },
});

export const FitsHeightToDocument = meta.story({
  play: async ({ canvasElement }) => {
    // 例の文書が測った高さを受け取ると、既定の高さを inline の高さで置き換える
    await waitFor(async () => {
      await expect(frameOf(canvasElement).style.blockSize).toMatch(/^\d+px$/u);
    });
  },
});

export const ReloadsOnReplay = meta.story({
  play: async ({ canvasElement, userEvent }) => {
    const before = frameOf(canvasElement);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'やり直す' }),
    );

    await waitFor(async () => {
      await expect(frameOf(canvasElement)).not.toBe(before);
    });
    await expect(before).not.toBeInTheDocument();
  },
});
