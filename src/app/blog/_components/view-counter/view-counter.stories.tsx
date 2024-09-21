import type { Meta, StoryObj } from '@storybook/react';
import { ViewCounter } from './view-counter';
import { kv } from '#src/mocks/vercel-kv.mock';

const meta: Meta<typeof ViewCounter> = {
  title: 'app/blog/view-counter',
  component: ViewCounter,
  beforeEach: () => {
    kv.incr.mockResolvedValue(74931);
  },
};

export default meta;
type Story = StoryObj<typeof ViewCounter>;

export const Primary: Story = {
  args: {
    slug: 'color-contrast',
  },
};
