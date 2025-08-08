import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { WakeLockDemo } from './wake-lock-demo';

const meta: Meta<typeof WakeLockDemo> = {
  title: 'playgrounds/screen-wake-lock/WakeLockDemo',
  component: WakeLockDemo,
  decorators: [
    (Story) => (
      <Playground>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WakeLockDemo>;

export const Default: Story = {};
