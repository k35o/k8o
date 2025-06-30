import { HighlightPriorityDemo } from './highlight-priority-demo';
import { Playground } from '../playground';
import type { Meta, StoryObj } from '@storybook/nextjs';

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
