import { expect } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { OfflineNoticeAlert } from './offline-notice-alert';

const meta = preview.meta({
  title: 'app/globals/offline-notice',
  component: OfflineNoticeAlert,
});

export const Primary = meta.story({
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('alert')).toBeInTheDocument();
    await expect(
      canvas.getByText(
        'オフラインです。接続が回復すると自動的に再試行します。',
      ),
    ).toBeInTheDocument();
  },
});
