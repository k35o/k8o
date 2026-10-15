import { Dialog, Modal } from '@k8ordo/ui';
import { BROWSER_LABELS } from '@repo/helpers/browser/detect-browser';
import type {
  CoreBrowser,
  BrowserMinVersions,
  DetectedBrowser,
} from '@repo/helpers/browser/detect-browser';
import type { FC } from 'react';

import styles from './browser-support-notice-modal.module.css';

// モバイル版はデスクトップと同じバージョンになるため、一覧はデスクトップのみ表示する。
const BROWSER_ORDER: CoreBrowser[] = ['chrome', 'edge', 'firefox', 'safari'];

// 「どうしたら良いか」を案内するモーダル。文面はここを編集する。
export const BrowserSupportNoticeModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  detected: DetectedBrowser;
  minVersions: BrowserMinVersions;
}> = ({ isOpen, onClose, detected, minVersions }) => (
  <Modal isOpen={isOpen} onClose={onClose} side="center">
    <Dialog.Root>
      <Dialog.Header onClose={onClose} title="ブラウザの更新について" />
      <Dialog.Content>
        <div className={styles.root}>
          <p>
            このサイトは、新しくブラウザに追加された機能を積極的に使っています。お使いのブラウザはバージョンが古いため、表示が崩れたり、一部の機能が正しく動作しないことがあります。最新版への更新をおすすめします。
          </p>
          <div className={styles.current}>
            <span className={styles.currentLabel}>お使いのブラウザ</span>
            <span className={styles.currentVersion}>
              {BROWSER_LABELS[detected.browser]} {detected.version}
            </span>
          </div>
          <div className={styles.recommended}>
            <p className={styles.recommendedTitle}>推奨バージョン</p>
            <dl className={styles.versions}>
              {BROWSER_ORDER.filter(
                (browser) => minVersions[browser] !== undefined,
              ).map((browser) => (
                <div className={styles.version} key={browser}>
                  <dt>{BROWSER_LABELS[browser]}</dt>
                  <dd className={styles.minVersion}>
                    {minVersions[browser]} 以降
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  </Modal>
);
