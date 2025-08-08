import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Spacing } from './spacing';

const meta: Meta<typeof Spacing> = {
  title: 'app/design-system/spacing',
  component: Spacing,
  decorators: [
    (Story) => (
      <div className="-m-6 min-h-screen bg-bg-base p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Spacing>;

export const Primary: Story = {};
