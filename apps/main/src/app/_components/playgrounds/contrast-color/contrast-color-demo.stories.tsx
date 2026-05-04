import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Playground } from '../playground';
import { ContrastColorDemo } from './contrast-color-demo';

const playgroundTitle = ContrastColorDemo.name;

const meta: Meta<typeof ContrastColorDemo> = {
  title: 'playgrounds/contrast-color/ContrastColorDemo',
  component: ContrastColorDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ContrastColorDemo>;

export const Default: Story = {};
