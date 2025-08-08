import type { Meta, StoryObj } from '@storybook/react-vite';
import { Progress } from '.';

const meta: Meta<typeof Progress> = {
  title: 'components/progress',
  component: Progress,
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Primary: Story = {
  args: {
    progress: 50,
    maxProgress: 100,
  },
};
