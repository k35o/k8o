import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { ScrollendDemo } from './scrollend-demo';

const meta: Meta<typeof ScrollendDemo> = {
  title: 'playgrounds/scrollend/ScrollendDemo',
  component: ScrollendDemo,
  decorators: [
    (Story) => (
      <Playground>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ScrollendDemo>;

export const Default: Story = {};
