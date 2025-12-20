import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { ScrollendTriggerDemo } from './scrollend-trigger-demo';

const meta: Meta<typeof ScrollendTriggerDemo> = {
  title: 'playgrounds/scrollend/ScrollendTriggerDemo',
  component: ScrollendTriggerDemo,
  decorators: [
    (Story) => (
      <Playground>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ScrollendTriggerDemo>;

export const Default: Story = {};
