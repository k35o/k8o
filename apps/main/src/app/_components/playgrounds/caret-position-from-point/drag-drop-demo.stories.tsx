import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { DragDropDemo } from './drag-drop-demo';

const meta: Meta<typeof DragDropDemo> = {
  title: 'playgrounds/caret-position-from-point/DragDropDemo',
  component: DragDropDemo,
  decorators: [
    (Story) => (
      <Playground>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof DragDropDemo>;

export const Default: Story = {};
