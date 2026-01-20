import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { UnitComparisonDemo } from './unit-comparison-demo';

const meta: Meta<typeof UnitComparisonDemo> = {
  title: 'playgrounds/root-font-units/UnitComparisonDemo',
  component: UnitComparisonDemo,
  decorators: [
    (Story) => (
      <Playground>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof UnitComparisonDemo>;

export const Default: Story = {};
