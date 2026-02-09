import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { DonutScopeDemo } from './donut-scope-demo';

const playgroundTitle = DonutScopeDemo.name;

const meta: Meta<typeof DonutScopeDemo> = {
  title: 'playgrounds/scope/DonutScopeDemo',
  component: DonutScopeDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof DonutScopeDemo>;

export const Default: Story = {};
