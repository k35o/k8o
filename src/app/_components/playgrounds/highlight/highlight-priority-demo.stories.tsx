import { HighlightPriorityDemo } from './highlight-priority-demo';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof HighlightPriorityDemo> = {
  title: 'playgrounds/highlight/HighlightPriorityDemo',
  component: HighlightPriorityDemo,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof HighlightPriorityDemo>;

export const Default: Story = {};
