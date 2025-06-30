import { SuspenseListDemo } from './suspense-list-demo';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof SuspenseListDemo> = {
  title: 'playgrounds/suspense-list/SuspenseListDemo',
  component: SuspenseListDemo,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof SuspenseListDemo>;

export const Default: Story = {};
