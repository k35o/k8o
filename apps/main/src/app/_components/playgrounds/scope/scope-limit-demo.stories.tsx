import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { ScopeLimitDemo } from './scope-limit-demo';

const playgroundTitle = ScopeLimitDemo.name;

const meta: Meta<typeof ScopeLimitDemo> = {
  title: 'playgrounds/scope/ScopeLimitDemo',
  component: ScopeLimitDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ScopeLimitDemo>;

export const Default: Story = {};
