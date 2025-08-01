import { ColorPallet } from './color-pallet';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

const meta: Meta<typeof ColorPallet> = {
  title: 'app/contrast-checker/color-pallet',
  component: ColorPallet,
};

export default meta;
type Story = StoryObj<typeof ColorPallet>;

export const Primary: Story = {
  render: () => {
    const [color, setColor] = useState('#000000');
    return (
      <ColorPallet label="デモ" color={color} setColor={setColor} />
    );
  },
};
