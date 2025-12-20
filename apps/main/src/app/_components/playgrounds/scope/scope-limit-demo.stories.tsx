import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { ScopeLimitDemo } from './scope-limit-demo';

const meta: Meta<typeof ScopeLimitDemo> = {
  title: 'playgrounds/scope/ScopeLimitDemo',
  component: ScopeLimitDemo,
  decorators: [
    (Story) => (
      <Playground>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ScopeLimitDemo>;

export const Default: Story = {};
