import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ProgressBar } from './progress-bar';

const meta: Meta<typeof ProgressBar> = {
  title: 'app/slides/slide-deck/progress-bar',
  component: ProgressBar,
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Start: Story = {
  args: { current: 0, total: 5 },
};

export const Middle: Story = {
  args: { current: 2, total: 5 },
};

export const End: Story = {
  args: { current: 4, total: 5 },
};
