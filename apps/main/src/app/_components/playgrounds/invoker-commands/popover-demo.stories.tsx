import type { Meta, StoryObj } from '@storybook/react';
import { PopoverDemo } from './popover-demo';

const meta: Meta<typeof PopoverDemo> = {
  component: PopoverDemo,
  title: 'playgrounds/PopoverDemo',
};

export default meta;
type Story = StoryObj<typeof PopoverDemo>;

export const Default: Story = {};
