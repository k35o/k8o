import { SuspenseListDemo } from './suspense-list-demo';
import { Playground } from '../playground';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof SuspenseListDemo> = {
  title: 'playgrounds/suspense-list/SuspenseListDemo',
  component: SuspenseListDemo,
  decorators: [
    (Story) => (
      <Playground>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SuspenseListDemo>;

export const Default: Story = {};
