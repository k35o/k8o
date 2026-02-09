import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { CaretPositionDemo } from './caret-position-demo';

const playgroundTitle = CaretPositionDemo.name;

const meta: Meta<typeof CaretPositionDemo> = {
  title: 'playgrounds/caret-position-from-point/CaretPositionDemo',
  component: CaretPositionDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof CaretPositionDemo>;

export const Default: Story = {};
