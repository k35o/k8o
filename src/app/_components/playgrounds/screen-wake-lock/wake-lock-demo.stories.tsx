import { WakeLockDemo } from './wake-lock-demo';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof WakeLockDemo> = {
  title: 'playgrounds/screen-wake-lock/WakeLockDemo',
  component: WakeLockDemo,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof WakeLockDemo>;

export const Default: Story = {};
