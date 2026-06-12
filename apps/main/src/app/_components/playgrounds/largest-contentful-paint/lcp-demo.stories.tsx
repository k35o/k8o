import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Playground } from '../playground';
import { LCPDemo } from './lcp-demo';

const playgroundTitle = LCPDemo.name;

const meta: Meta<typeof LCPDemo> = {
  title: 'playgrounds/largest-contentful-paint/LCPDemo',
  component: LCPDemo,
  // PerformanceObserverの実測値（startTime/size等）を表示するデモのため、VRTの対象外にする
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

type Story = StoryObj<typeof LCPDemo>;

export const Default: Story = {};
