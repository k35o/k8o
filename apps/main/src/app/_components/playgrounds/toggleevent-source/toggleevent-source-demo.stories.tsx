import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Playground } from '../playground';
import { ToggleEventSourceDemo } from './toggleevent-source-demo';

const playgroundTitle = ToggleEventSourceDemo.name;

const meta: Meta<typeof ToggleEventSourceDemo> = {
  title: 'playgrounds/toggleevent-source/ToggleEventSourceDemo',
  component: ToggleEventSourceDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ToggleEventSourceDemo>;

export const Default: Story = {};
