import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Typography } from './typography';

const meta: Meta<typeof Typography> = {
  title: 'app/design-system/typography',
  component: Typography,
  decorators: [
    (Story) => (
      <div className="-m-6 min-h-screen bg-bg-base p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Primary: Story = {};
