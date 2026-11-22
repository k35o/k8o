import { expect, waitFor } from 'storybook/test';

import { Stage } from '@/components/talks/slide-deck/stage/stage';

import preview from '../../../../.storybook/preview';
import { PdfPage } from './pdf-page';
import type { Block } from './pdf-page-text';

import styles from './pdf-page.stories.module.css';

const IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect width='1920' height='1080' fill='%23222'/%3E%3C/svg%3E";

const LINE = {
  text: 'const key = resolveShorthand(prop)',
  left: 0.1,
  top: 0.4,
  width: 0.7,
  height: 0.05,
};

const meta = preview.meta({
  title: 'app/talks/pdf-page',
  component: PdfPage,
  decorators: [
    (Story) => (
      <div className={styles.frame}>
        <Stage bleed flush>
          <Story />
        </Stage>
      </div>
    ),
  ],
  args: {
    label: '3枚目',
    src: IMAGE,
    srcSet: `${IMAGE} 1920w`,
    width: 1920,
    height: 1080,
    blocks: [
      {
        tag: 'h2',
        lines: [
          {
            text: '生成された型の中身',
            left: 0.1,
            top: 0.1,
            width: 0.5,
            height: 0.08,
          },
        ],
      },
      { tag: 'img', alt: '会社の紹介' },
      {
        tag: 'p',
        lines: [
          LINE,
          { text: '2 行目', left: 0.1, top: 0.5, width: 0.2, height: 0.05 },
        ],
      },
    ] satisfies Block[],
    links: [
      {
        href: 'https://k8o.me/blog',
        left: 0.1,
        top: 0.8,
        width: 0.2,
        height: 0.1,
      },
    ],
  },
});

export const WithText = meta.story({
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 2, name: '生成された型の中身' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('img', { name: '会社の紹介' }),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole('img', { name: '3枚目' }),
    ).not.toBeInTheDocument();
  },
});

export const TextLinesUpWithImage = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvas, canvasElement }) => {
    const image = canvasElement.querySelector('img');
    if (image === null) throw new Error('ページの画像が無い');
    const line = canvas.getByText(LINE.text);

    await waitFor(async () => {
      const page = image.getBoundingClientRect();
      const text = document.createRange();
      text.selectNodeContents(line);
      const { x, width } = text.getBoundingClientRect();
      const { y, height } = line.getBoundingClientRect();
      await expect(Math.abs(page.width - 640)).toBeLessThan(2);
      await expect(Math.abs(x - page.x - 64)).toBeLessThan(2);
      await expect(Math.abs(y - page.y - 144)).toBeLessThan(2);
      await expect(Math.abs(width - 448)).toBeLessThan(2);
      await expect(Math.abs(height - 18)).toBeLessThan(2);
    });
  },
});

export const SelectText = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvas }) => {
    const line = canvas.getByText(LINE.text);
    await waitFor(async () => {
      const { x, y, width, height } = line.getBoundingClientRect();
      await expect(
        document.elementFromPoint(x + width / 2, y + height / 2),
      ).toBe(line);
    });

    getSelection()?.selectAllChildren(line);

    await expect(getSelection()?.toString()).toBe(LINE.text);
    await expect(getComputedStyle(line).color).toBe('rgba(0, 0, 0, 0)');
  },
});

export const LinkStaysOnTop = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'https://k8o.me/blog' });
    const { x, y, width, height } = link.getBoundingClientRect();

    await expect(document.elementFromPoint(x + width / 2, y + height / 2)).toBe(
      link,
    );
  },
});

export const WithoutText = meta.story({
  args: { blocks: [] },
  parameters: { vrt: { skip: true } },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('img', { name: '3枚目' }),
    ).toBeInTheDocument();
  },
});
