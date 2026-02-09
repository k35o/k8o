import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { SuspenseListDemo } from './suspense-list-demo';

const playgroundTitle = SuspenseListDemo.name;

const meta: Meta<typeof SuspenseListDemo> = {
  title: 'playgrounds/suspense-list/SuspenseListDemo',
  component: SuspenseListDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SuspenseListDemo>;

export const Default: Story = {};
