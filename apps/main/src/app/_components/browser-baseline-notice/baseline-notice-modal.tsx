import { Dialog, Modal } from '@k8o/arte-odyssey';
import { BROWSER_LABELS } from '@repo/helpers/browser/detect-browser';
import type {
  BaselineBrowser,
  BaselineMinVersions,
  DetectedBrowser,
} from '@repo/helpers/browser/detect-browser';
import type { FC } from 'react';

// モバイル版はデスクトップと同じバージョンになるため、一覧はデスクトップのみ表示する。
const BROWSER_ORDER: BaselineBrowser[] = [
  'chrome',
  'edge',
  'firefox',
  'safari',
];

// 「どうしたら良いか」を案内するモーダル。文面はここを編集する。
export const BaselineNoticeModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  detected: DetectedBrowser;
  minVersions: BaselineMinVersions;
}> = ({ isOpen, onClose, detected, minVersions }) => (
  <Modal isOpen={isOpen} onClose={onClose} type="center">
    <Dialog.Root>
      <Dialog.Header onClose={onClose} title="ブラウザの更新について" />
      <Dialog.Content>
        <div className="text-fg-base flex flex-col gap-4 text-sm leading-relaxed">
          <p>
            このサイトは、新しくブラウザに追加された機能（Baseline
            入り）を積極的に使っています。お使いのブラウザはバージョンが古いため、表示が崩れたり、一部の機能が正しく動作しないことがあります。最新版への更新をおすすめします。
          </p>
          <div className="border-border-base flex items-baseline justify-between gap-4 rounded-lg border p-3">
            <span className="text-fg-mute">お使いのブラウザ</span>
            <span className="font-bold">
              {BROWSER_LABELS[detected.browser]} {detected.version}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-bold">推奨バージョン</p>
            <dl className="border-border-base flex flex-col gap-1.5 rounded-lg border p-3">
              {BROWSER_ORDER.filter(
                (browser) => minVersions[browser] !== undefined,
              ).map((browser) => (
                <div
                  className="flex items-baseline justify-between gap-4"
                  key={browser}
                >
                  <dt>{BROWSER_LABELS[browser]}</dt>
                  <dd className="font-bold">{minVersions[browser]} 以降</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  </Modal>
);
