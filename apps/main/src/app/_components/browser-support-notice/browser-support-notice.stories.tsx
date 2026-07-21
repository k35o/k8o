import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { BrowserSupportNotice } from './browser-support-notice';

// 実際のブラウザより高い最低バージョンを渡し、検出されたブラウザが必ず
// 「最新ではない」と判定されるようにして、警告が表示される状態を再現する。
const FORCE_OUTDATED = {
  chrome: '9999',
  chrome_android: '9999',
  edge: '9999',
  firefox: '9999',
  firefox_android: '9999',
  safari: '9999',
  safari_ios: '9999',
};

const meta: Meta<typeof BrowserSupportNotice> = {
  title: 'app/globals/browser-support-notice',
  component: BrowserSupportNotice,
  beforeEach: () => {
    sessionStorage.removeItem('k8o:browser-support-notice-dismissed');
  },
};

export default meta;
type Story = StoryObj<typeof BrowserSupportNotice>;

export const Primary: Story = {
  args: {
    minVersions: FORCE_OUTDATED,
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('alert')).toBeInTheDocument();
  },
};

export const OpenModal: Story = {
  args: {
    minVersions: FORCE_OUTDATED,
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: '詳しくはこちら' }),
    );

    await expect(
      await canvas.findByRole('dialog', { name: 'ブラウザの更新について' }),
    ).toBeInTheDocument();
    await expect(canvas.getByText('推奨バージョン')).toBeInTheDocument();
  },
};

export const Dismiss: Story = {
  args: {
    minVersions: FORCE_OUTDATED,
  },
  play: async ({ canvas, userEvent }) => {
    await expect(await canvas.findByRole('alert')).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', { name: 'この通知を閉じる' }),
    );

    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};
