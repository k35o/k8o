import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { HighlightPriorityDemo } from './highlight-priority-demo';

const meta: Meta<typeof HighlightPriorityDemo> = {
  title: 'playgrounds/highlight/HighlightPriorityDemo',
  component: HighlightPriorityDemo,
  decorators: [
    (Story) => (
      <Playground>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HighlightPriorityDemo>;

export const Default: Story = {};
