import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { ShapeFunctionDemo } from './shape-function-demo';

const playgroundTitle = ShapeFunctionDemo.name;

const meta: Meta<typeof ShapeFunctionDemo> = {
  title: 'playgrounds/shape-function/ShapeFunctionDemo',
  component: ShapeFunctionDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ShapeFunctionDemo>;

export const Default: Story = {};
