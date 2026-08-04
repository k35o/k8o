import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { OfflineNoticeAlert } from './offline-notice-alert';

const meta: Meta<typeof OfflineNoticeAlert> = {
  title: 'app/globals/offline-notice',
  component: OfflineNoticeAlert,
};

export default meta;
type Story = StoryObj<typeof OfflineNoticeAlert>;

export const Primary: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('alert')).toBeInTheDocument();
    await expect(
      canvas.getByText(
        'オフラインです。接続が回復すると自動的に再試行します。',
      ),
    ).toBeInTheDocument();
  },
};
