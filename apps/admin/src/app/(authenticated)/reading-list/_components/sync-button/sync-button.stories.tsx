import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { SyncButton } from './sync-button';

const meta: Meta<typeof SyncButton> = {
  title: 'admin/reading-list/sync-button',
  component: SyncButton,
};

export default meta;
type Story = StoryObj<typeof SyncButton>;

export const Primary: Story = {};

export const DisplaysSyncButton: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('button', { name: '記事を同期' }),
    ).toBeInTheDocument();
  },
};
