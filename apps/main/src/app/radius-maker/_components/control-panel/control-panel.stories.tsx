import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { ControlPanel } from './control-panel';

const meta: Meta<typeof ControlPanel> = {
  title: 'app/radius-maker/control-panel',
  component: ControlPanel,
};

export default meta;
type Story = StoryObj<typeof ControlPanel>;

export const Primary: Story = {};

export const InitialState: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // コピーボタンが存在することを確認
    const copyButton = canvas.getByRole('button', { name: '値をコピーする' });
    await expect(copyButton).toBeInTheDocument();

    // border-radiusの値が水平/垂直で表示されることを確認
    await expect(canvas.getByText('水平')).toBeInTheDocument();
    await expect(canvas.getByText('垂直')).toBeInTheDocument();
    // 水平の値（4つのパーセント値）
    await expect(
      canvas.getByText(/\d+%\s+\d+%\s+\d+%\s+\d+%/),
    ).toBeInTheDocument();
  },
};

export const ControlButtons: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 8つの操作ボタンが存在することを確認
    await expect(
      canvas.getByRole('button', {
        name: '左上の上側の丸みを調整する(左右キーで操作します)',
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', {
        name: '右上の上側の丸みを調整する(左右キーで操作します)',
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', {
        name: '左上の左側の丸みを調整する(上下キーで操作します)',
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', {
        name: '右上の右側の丸みを調整する(上下キーで操作します)',
      }),
    ).toBeInTheDocument();
  },
};
