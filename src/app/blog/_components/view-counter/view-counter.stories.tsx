import type { Meta, StoryObj } from '@storybook/react';
import { ViewCoounter } from './view-counter';
import { kv } from '#src/mocks/vercel-kv.mock';

const meta: Meta<typeof ViewCoounter> = {
  title: 'app/blog/view-counter',
  component: ViewCoounter,
  beforeEach: () => {
    kv.incr.mockResolvedValue(74931);
  },
};

export default meta;
type Story = StoryObj<typeof ViewCoounter>;

export const Primary: Story = {
  args: {
    slug: 'color-contrast',
  },
};
