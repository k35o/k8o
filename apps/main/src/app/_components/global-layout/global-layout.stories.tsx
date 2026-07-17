import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { GlobalLayout } from './global-layout';

const meta: Meta<typeof GlobalLayout> = {
  title: 'app/globals/global-layout',
  component: GlobalLayout,
  beforeEach: () => {
    // browser-baseline-notice の Dismiss Story が同一セッションの sessionStorage に
    // dismissed を残すと OutdatedBrowser のバナーが消えて VRT が不安定になるため、
    // Story 実行前に必ずクリアする。
    sessionStorage.removeItem('k8o:browser-baseline-notice-dismissed');
  },
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
};
