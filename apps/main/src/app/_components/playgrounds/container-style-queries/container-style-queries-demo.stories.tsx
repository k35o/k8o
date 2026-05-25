import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Playground } from '../playground';
import { ContainerStyleQueriesDemo } from './container-style-queries-demo';

const playgroundTitle = ContainerStyleQueriesDemo.name;

const meta: Meta<typeof ContainerStyleQueriesDemo> = {
  title: 'playgrounds/container-style-queries/ContainerStyleQueriesDemo',
  component: ContainerStyleQueriesDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ContainerStyleQueriesDemo>;

export const Default: Story = {};
