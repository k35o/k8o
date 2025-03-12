import { Radius } from './radius';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Radius> = {
  title: 'app/design-system/radius',
  component: Radius,
  decorators: [
    (Story) => (
      <div className="bg-bg-base -m-6 min-h-screen p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Radius>;

export const Primary: Story = {};
