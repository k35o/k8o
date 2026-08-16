import { expect, within } from 'storybook/test';

import preview from '../../../../../../.storybook/preview';
import { SyncButton } from './sync-button';

const meta = preview.meta({
  title: 'admin/reading-list/sync-button',
  component: SyncButton,
});

export const Primary = meta.story();

export const DisplaysSyncButton = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('button', { name: '記事を同期' }),
    ).toBeInTheDocument();
  },
});
