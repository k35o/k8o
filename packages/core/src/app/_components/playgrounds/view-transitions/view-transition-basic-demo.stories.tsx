import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { ViewTransitionBasicDemo } from './view-transition-basic-demo';

const meta: Meta<typeof ViewTransitionBasicDemo> = {
  title: 'playgrounds/view-transitions/ViewTransitionBasicDemo',
  component: ViewTransitionBasicDemo,
  decorators: [
    (Story) => (
      <Playground>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ViewTransitionBasicDemo>;

export const Default: Story = {};
