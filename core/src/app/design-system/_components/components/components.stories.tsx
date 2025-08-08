import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Components } from './components';

const meta: Meta<typeof Components> = {
  title: 'app/design-system/components',
  component: Components,
  decorators: [
    (Story) => (
      <div className="-m-6 min-h-screen bg-bg-base p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Components>;

export const Primary: Story = {};
