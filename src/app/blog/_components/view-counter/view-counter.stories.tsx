import type { Meta, StoryObj } from '@storybook/react';
import { ViewCounter } from './view-counter';
import { getBlogView } from '#src/mocks/actions/blog.mock';

const meta: Meta<typeof ViewCounter> = {
  title: 'app/blog/view-counter',
  component: ViewCounter,
  beforeEach: () => {
    getBlogView.mockResolvedValue(74931);
  },
};

export default meta;
type Story = StoryObj<typeof ViewCounter>;

export const Primary: Story = {
  args: {
    blogId: 1,
  },
};
