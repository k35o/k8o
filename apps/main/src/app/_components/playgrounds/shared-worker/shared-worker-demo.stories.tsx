import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Playground } from '../playground';
import { SharedWorkerDemo } from './shared-worker-demo';

const playgroundTitle = SharedWorkerDemo.name;

const meta: Meta<typeof SharedWorkerDemo> = {
  title: 'playgrounds/shared-worker/SharedWorkerDemo',
  component: SharedWorkerDemo,
  // SharedWorkerの起動時刻（実時刻）と接続数を表示するデモのため、VRTの対象外にする
  parameters: { vrt: { skip: true } },
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
