import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, within } from 'storybook/test';

import { BLOB_CORNERS } from '../../_utils/presets';
import { RadiusCanvas } from './radius-canvas';

const meta: Meta<typeof RadiusCanvas> = {
  title: 'app/radius-maker/radius-canvas',
  component: RadiusCanvas,
};

export default meta;
type Story = StoryObj<typeof RadiusCanvas>;

export const Primary: Story = {
  args: {
    corners: BLOB_CORNERS,
    shape: 'round',
    width: 192,
    height: 192,
    onChangeValue: fn(() => {}),
  },
};

export const Handles: Story = {
  args: {
    corners: BLOB_CORNERS,
    shape: 'round',
    width: 192,
    height: 192,
    onChangeValue: fn(() => {}),
  },
  play: async ({ args, canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // 4つの角×2方向の8ハンドルがあり、現在値を公開している
    const sliders = canvas.getAllByRole('slider');
    await expect(sliders).toHaveLength(8);
    const topLeftX = canvas.getByRole('slider', {
      name: '左上の水平方向の丸み',
    });
    await expect(topLeftX).toHaveAttribute('aria-valuenow', '30');

    // 矢印キーの操作が値の変更として通知される
    topLeftX.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(args.onChangeValue).toHaveBeenLastCalledWith(
      'topLeft',
      'x',
      31,
    );

    // 右上の水平ハンドルは画面の向きと値の向きが逆になる
    const topRightX = canvas.getByRole('slider', {
      name: '右上の水平方向の丸み',
    });
    topRightX.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(args.onChangeValue).toHaveBeenLastCalledWith(
      'topRight',
      'x',
      69,
    );
  },
};

export const Landscape: Story = {
  args: {
    corners: BLOB_CORNERS,
    shape: 'round',
    width: 320,
    height: 160,
    onChangeValue: fn(() => {}),
  },
};
