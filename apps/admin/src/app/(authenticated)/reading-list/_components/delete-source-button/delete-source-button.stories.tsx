import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { DeleteSourceButton } from './delete-source-button';

const meta: Meta<typeof DeleteSourceButton> = {
  title: 'admin/reading-list/delete-source-button',
  component: DeleteSourceButton,
};

export default meta;
type Story = StoryObj<typeof DeleteSourceButton>;

export const Primary: Story = {
  args: {
    id: 1,
    title: 'web.dev',
  },
};
