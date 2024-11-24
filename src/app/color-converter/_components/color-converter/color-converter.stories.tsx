import type { Meta, StoryObj } from '@storybook/react';
import { ColorConverter } from './color-converter';

const meta: Meta<typeof ColorConverter> = {
  title: 'app/color-converter/color-converter',
  component: ColorConverter,
};

export default meta;
type Story = StoryObj<typeof ColorConverter>;

export const Primary: Story = {};
