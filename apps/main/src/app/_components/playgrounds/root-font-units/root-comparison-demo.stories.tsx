import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { RootComparisonDemo } from './root-comparison-demo';

const meta: Meta<typeof RootComparisonDemo> = {
  title: 'playgrounds/root-font-units/RootComparisonDemo',
  component: RootComparisonDemo,
  decorators: [
    (Story) => (
      <Playground>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof RootComparisonDemo>;

export const Default: Story = {};
