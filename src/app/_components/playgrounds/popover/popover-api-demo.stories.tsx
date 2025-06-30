import { PopoverApiDemo } from './popover-api-demo';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof PopoverApiDemo> = {
  title: 'playgrounds/popover/PopoverApiDemo',
  component: PopoverApiDemo,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof PopoverApiDemo>;

export const Default: Story = {};
