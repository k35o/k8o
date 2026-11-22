import { Dialog, Modal, Stack } from '@k8ordo/ui';
import type {
  BrowserMinVersions,
  CoreBrowser,
} from '@repo/helpers/browser/core-browsers';
import type { FC } from 'react';

import styles from './browser-support-notice-modal.module.css';

// モバイル版はデスクトップと同じバージョンになるため、一覧はデスクトップのみ表示する。
const RECOMMENDED_BROWSERS: Array<{ browser: CoreBrowser; label: string }> = [
  { browser: 'chrome', label: 'Chrome' },
  { browser: 'edge', label: 'Edge' },
  { browser: 'firefox', label: 'Firefox' },
  { browser: 'safari', label: 'Safari' },
];

// 「どうしたら良いか」を案内するモーダル。文面はここを編集する。
export const BrowserSupportNoticeModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  minVersions: BrowserMinVersions;
}> = ({ isOpen, onClose, minVersions }) => (
  <Modal isOpen={isOpen} onClose={onClose} side="center">
    <Dialog.Root>
      <Dialog.Header onClose={onClose} title="対応ブラウザについて" />
      <Dialog.Content>
        <div className={styles.root}>
          <p>
            このサイトは、Baseline（主要なブラウザで使える機能）に入った新しい機能を積極的に使っています。お使いのブラウザはその一部に対応していないため、表示が崩れたり、一部の機能が正しく動作しないことがあります。最新版に更新するか、推奨バージョン以降のブラウザをご利用ください。
          </p>
          <Stack gap="sm">
            <p className={styles.recommendedTitle}>推奨バージョン</p>
            <dl className={styles.versions}>
              {RECOMMENDED_BROWSERS.filter(
                ({ browser }) => minVersions[browser] !== undefined,
              ).map(({ browser, label }) => (
                <div className={styles.version} key={browser}>
                  <dt>{label}</dt>
                  <dd className={styles.minVersion}>
                    {minVersions[browser]} 以降
                  </dd>
                </div>
              ))}
            </dl>
          </Stack>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  </Modal>
);
