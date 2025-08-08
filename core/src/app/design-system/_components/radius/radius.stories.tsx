import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Radius } from './radius';

const meta: Meta<typeof Radius> = {
  title: 'app/design-system/radius',
  component: Radius,
  decorators: [
    (Story) => (
      <div className="-m-6 min-h-screen bg-bg-base p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Radius>;

export const Primary: Story = {};
