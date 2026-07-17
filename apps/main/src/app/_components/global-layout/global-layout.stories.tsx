import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { GlobalLayout } from './global-layout';

const meta: Meta<typeof GlobalLayout> = {
  title: 'app/globals/global-layout',
  component: GlobalLayout,
};

export default meta;
type Story = StoryObj<typeof GlobalLayout>;

export const Primary: Story = {};

// 古いブラウザ判定時: 最上部に常時バナー、ヘッダーに警告マークが出る。
export const OutdatedBrowser: Story = {
  args: {
    minVersions: {
      chrome: '9999',
      chrome_android: '9999',
      edge: '9999',
      firefox: '9999',
      firefox_android: '9999',
      safari: '9999',
      safari_ios: '9999',
    },
  },
  // テストは同一ページで実行されるため、browser-baseline-notice の Dismiss 実行後だと
  // 閉じた状態が sessionStorage に残ってバナーが出なくなる。毎回クリアして状態を揃える
  beforeEach: () => {
    sessionStorage.removeItem('k8o:browser-baseline-notice-dismissed');
  },
  // バナーはクライアント側のブラウザ判定後に描画されるため、表示を待ってから
  // VRT のスクリーンショットが撮影されるようにする
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('alert')).toBeInTheDocument();
  },
};
