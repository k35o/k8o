import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { ActiveViewTransitionDemo } from './active-view-transition-demo';

const meta: Meta<typeof ActiveViewTransitionDemo> = {
  title: 'playgrounds/active-view-transition/ActiveViewTransitionDemo',
  component: ActiveViewTransitionDemo,
  decorators: [
    (Story) => (
      <Playground>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ActiveViewTransitionDemo>;

export const Default: Story = {};
