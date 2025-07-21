import { Spacing } from './spacing';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta: Meta<typeof Spacing> = {
  title: 'app/design-system/spacing',
  component: Spacing,
  decorators: [
    (Story) => (
      <div className="bg-bg-base -m-6 min-h-screen p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Spacing>;

export const Primary: Story = {};
