import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { ScopeProximityDemo } from './scope-proximity-demo';

const meta: Meta<typeof ScopeProximityDemo> = {
  title: 'playgrounds/scope/ScopeProximityDemo',
  component: ScopeProximityDemo,
  decorators: [
    (Story) => (
      <Playground>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ScopeProximityDemo>;

export const Default: Story = {};
