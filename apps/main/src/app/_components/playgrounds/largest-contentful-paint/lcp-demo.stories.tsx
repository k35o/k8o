import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { LCPDemo } from './lcp-demo';

const meta: Meta<typeof LCPDemo> = {
  title: 'playgrounds/largest-contentful-paint/LCPDemo',
  component: LCPDemo,
  decorators: [
    (Story) => (
      <Playground>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof LCPDemo>;

export const Default: Story = {};
