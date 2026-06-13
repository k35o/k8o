import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, within } from 'storybook/test';

import { BLOB_CORNERS, RADIUS_PRESETS } from '../../_utils/presets';
import { TemplateSelector } from './template-selector';

const meta: Meta<typeof TemplateSelector> = {
  title: 'app/radius-maker/template-selector',
  component: TemplateSelector,
};

export default meta;
type Story = StoryObj<typeof TemplateSelector>;

export const Primary: Story = {
  args: {
    corners: BLOB_CORNERS,
    onSelect: fn(() => {}),
  },
};

export const SelectPreset: Story = {
  args: {
    corners: BLOB_CORNERS,
    onSelect: fn(() => {}),
  },
  play: async ({ args, canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // すべてのプリセットが選択肢として表示される
    await Promise.all(
      RADIUS_PRESETS.map((preset) =>
        expect(
          canvas.getByRole('button', { name: preset.name }),
        ).toBeInTheDocument(),
      ),
    );

    // 現在の値と一致するプリセットが選択されている
    await expect(
      canvas.getByRole('button', { name: 'ブロブ' }),
    ).toHaveAttribute('aria-pressed', 'true');

    // プリセットを選ぶとその形状が通知される
    await userEvent.click(canvas.getByRole('button', { name: '円' }));
    await expect(args.onSelect).toHaveBeenLastCalledWith({
      topLeft: { x: 50, y: 50 },
      topRight: { x: 50, y: 50 },
      bottomRight: { x: 50, y: 50 },
      bottomLeft: { x: 50, y: 50 },
    });
  },
};

export const RandomBlob: Story = {
  args: {
    corners: BLOB_CORNERS,
    onSelect: fn(() => {}),
  },
  play: async ({ args, canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // ランダム生成ボタンで新しい形状が通知される
    // (生成される値の不変条件はrandom-blob.tsのテストで担保している)
    await userEvent.click(canvas.getByRole('button', { name: 'ランダム' }));
    await expect(args.onSelect).toHaveBeenCalledTimes(1);
  },
};
