import { expect, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { Stage } from './stage';

import styles from './stage.stories.module.css';

const meta = preview.meta({
  title: 'app/talks/slide-deck/stage',
  component: Stage,
  decorators: [
    (Story) => (
      <div className={styles.frame}>
        <Story />
      </div>
    ),
  ],
});

export const Empty = meta.story({
  args: {
    children: null,
  },
});

export const WithContent = meta.story({
  args: {
    children: (
      <>
        <h2>サンプル見出し</h2>
        <p>ステージは 16:9 を維持しながら親要素にフィットします。</p>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { name: 'サンプル見出し' }),
    ).toBeInTheDocument();
  },
});

export const WithQRCode = meta.story({
  args: {
    qrUrl: 'https://k8o.me/talks/sample-deck',
    children: <h2>QR 付き</h2>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('img', { name: /QRコード/u }),
    ).toBeInTheDocument();
  },
});

export const Bleed = meta.story({
  args: {
    bleed: true,
    qrUrl: 'https://k8o.me/talks/sample-deck',
    children: <h2>全面に描く</h2>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { name: '全面に描く' }),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole('img', { name: /QRコード/u }),
    ).not.toBeInTheDocument();
  },
});
