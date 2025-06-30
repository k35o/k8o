import { PrintColorAdjustDemo } from './print-color-adjust-demo';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof PrintColorAdjustDemo> = {
  title: 'playgrounds/print-color-adjust/PrintColorAdjustDemo',
  component: PrintColorAdjustDemo,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof PrintColorAdjustDemo>;

export const Default: Story = {};
