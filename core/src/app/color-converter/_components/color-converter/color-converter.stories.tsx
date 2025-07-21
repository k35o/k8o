import { ColorConverter } from './color-converter';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta: Meta<typeof ColorConverter> = {
  title: 'app/color-converter/color-converter',
  component: ColorConverter,
};

export default meta;
type Story = StoryObj<typeof ColorConverter>;

export const Primary: Story = {};
