import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { ScrollbarColorDemo } from './scrollbar-color-demo';

const playgroundTitle = ScrollbarColorDemo.name;

const meta: Meta<typeof ScrollbarColorDemo> = {
  title: 'playgrounds/scrollbar-color/ScrollbarColorDemo',
  component: ScrollbarColorDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ScrollbarColorDemo>;

export const Default: Story = {};
