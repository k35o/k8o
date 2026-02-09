import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { ScopeProximityDemo } from './scope-proximity-demo';

const playgroundTitle = ScopeProximityDemo.name;

const meta: Meta<typeof ScopeProximityDemo> = {
  title: 'playgrounds/scope/ScopeProximityDemo',
  component: ScopeProximityDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ScopeProximityDemo>;

export const Default: Story = {};
