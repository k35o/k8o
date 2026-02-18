import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { expect, within } from 'storybook/test';
import { ColorPallet } from './color-pallet';

const meta: Meta<typeof ColorPallet> = {
  title: 'app/contrast-checker/color-pallet',
  component: ColorPallet,
};

export default meta;
type Story = StoryObj<typeof ColorPallet>;

const PrimaryRender = () => {
  const [color, setColor] = useState('#000000');
  return <ColorPallet color={color} label="デモ" setColor={setColor} />;
};

export const Primary: Story = {
  render: () => <PrimaryRender />,
};

const DisplaysLabelRender = () => {
  const [color, setColor] = useState('#000000');
  return <ColorPallet color={color} label="背景色" setColor={setColor} />;
};

export const DisplaysLabel: Story = {
  render: () => <DisplaysLabelRender />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // ラベルが表示されていることを確認
    await expect(canvas.getByText('背景色')).toBeInTheDocument();
  },
};

const DisplaysColorValueRender = () => {
  const [color, setColor] = useState('#ff5733');
  return <ColorPallet color={color} label="文字色" setColor={setColor} />;
};

export const DisplaysColorValue: Story = {
  render: () => <DisplaysColorValueRender />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 色の値が表示されていることを確認
    await expect(canvas.getByText('#ff5733')).toBeInTheDocument();
  },
};

const HasColorInputRender = () => {
  const [color, setColor] = useState('#000000');
  return <ColorPallet color={color} label="色を選択" setColor={setColor} />;
};

export const HasColorInput: Story = {
  render: () => <HasColorInputRender />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // カラーピッカーが存在することを確認
    const colorInput = canvas.getByLabelText('色を選択');
    await expect(colorInput).toBeInTheDocument();
    await expect(colorInput).toHaveAttribute('type', 'color');
  },
};
