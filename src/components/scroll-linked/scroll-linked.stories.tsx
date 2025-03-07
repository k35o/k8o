import { ScrollLinked } from './scroll-linked';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ScrollLinked> = {
  title: 'components/scroll-linked',
  component: ScrollLinked,
};

export default meta;
type Story = StoryObj<typeof ScrollLinked>;

export const NoScroll: Story = {};

export const Scroll: Story = {
  decorators: [
    (Story) => (
      <div className="h-lvh overflow-y-scroll">
        <Story />
      </div>
    ),
  ],
};
