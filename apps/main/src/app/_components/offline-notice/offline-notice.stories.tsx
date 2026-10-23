import { expect, spyOn, waitFor } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { OfflineNotice } from './offline-notice';

const MESSAGE = 'オフラインです。接続が回復すると自動的に再試行します。';

// Storybook を動かすブラウザはオンラインのままなので、navigator.onLine を差し替えてから
// ブラウザと同じイベントを送る
const stubOnLine = (onLine: boolean): void => {
  spyOn(Navigator.prototype, 'onLine', 'get').mockReturnValue(onLine);
};

const meta = preview.meta({
  title: 'app/globals/offline-notice',
  component: OfflineNotice,
});

export const GoesOffline = meta.story({
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();

    stubOnLine(false);
    window.dispatchEvent(new Event('offline'));

    await expect(await canvas.findByRole('alert')).toHaveTextContent(MESSAGE);
  },
});

export const BackOnline = meta.story({
  beforeEach: () => {
    stubOnLine(false);
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('alert')).toHaveTextContent(MESSAGE);

    stubOnLine(true);
    window.dispatchEvent(new Event('online'));

    await waitFor(async () => {
      await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
    });
  },
});
