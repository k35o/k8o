import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Playground } from '../playground';
import { SharedWorkerDemo } from './shared-worker-demo';

const playgroundTitle = SharedWorkerDemo.name;

const meta: Meta<typeof SharedWorkerDemo> = {
  title: 'playgrounds/shared-worker/SharedWorkerDemo',
  component: SharedWorkerDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SharedWorkerDemo>;

export const Default: Story = {};
