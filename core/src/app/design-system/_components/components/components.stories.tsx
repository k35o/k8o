import { Components } from './components';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta: Meta<typeof Components> = {
  title: 'app/design-system/components',
  component: Components,
  decorators: [
    (Story) => (
      <div className="bg-bg-base -m-6 min-h-screen p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Components>;

export const Primary: Story = {};
