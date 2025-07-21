import { Typography } from './typography';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta: Meta<typeof Typography> = {
  title: 'app/design-system/typography',
  component: Typography,
  decorators: [
    (Story) => (
      <div className="bg-bg-base -m-6 min-h-screen p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Primary: Story = {};
