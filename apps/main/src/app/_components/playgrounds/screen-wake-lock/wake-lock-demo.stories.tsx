import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { WakeLockDemo } from './wake-lock-demo';

const playgroundTitle = WakeLockDemo.name;

const meta: Meta<typeof WakeLockDemo> = {
  title: 'playgrounds/screen-wake-lock/WakeLockDemo',
  component: WakeLockDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WakeLockDemo>;

export const Default: Story = {};
