import { useState } from 'react';
import { expect, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { ColorPallet } from './color-pallet';

const meta = preview.meta({
  title: 'app/contrast-checker/color-pallet',
  component: ColorPallet,
});

const PrimaryRender = () => {
  const [color, setColor] = useState('#000000');
  return <ColorPallet color={color} label="デモ" setColor={setColor} />;
};

export const Primary = meta.story({
  render: () => <PrimaryRender />,
});

const DisplaysLabelRender = () => {
  const [color, setColor] = useState('#000000');
  return <ColorPallet color={color} label="背景色" setColor={setColor} />;
};

export const DisplaysLabel = meta.story({
  render: () => <DisplaysLabelRender />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('背景色')).toBeInTheDocument();
  },
});

const DisplaysColorValueRender = () => {
  const [color, setColor] = useState('#ff5733');
  return <ColorPallet color={color} label="文字色" setColor={setColor} />;
};

export const DisplaysColorValue = meta.story({
  render: () => <DisplaysColorValueRender />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('#ff5733')).toBeInTheDocument();
  },
});

const HasColorInputRender = () => {
  const [color, setColor] = useState('#000000');
  return <ColorPallet color={color} label="色を選択" setColor={setColor} />;
};

export const HasColorInput = meta.story({
  render: () => <HasColorInputRender />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const colorInput = canvas.getByLabelText('色を選択');
    await expect(colorInput).toBeInTheDocument();
    await expect(colorInput).toHaveAttribute('type', 'color');
  },
});
