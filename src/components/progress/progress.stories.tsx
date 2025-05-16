import { Progress } from '.';
import type { Meta, StoryObj } from '@storybook/nextjs';

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
