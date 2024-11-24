import type { Meta, StoryObj } from '@storybook/react';
import { ColorPallet } from './color-pallet';
import { useState } from 'react';

const meta: Meta<typeof ColorPallet> = {
  title: 'components/form/color-pallet',
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
