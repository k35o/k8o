'use client';

import { Alert, useDisclosure, useSessionStorage } from '@k8o/arte-odyssey';
import { isBrowserOutdated } from '@repo/helpers/browser/baseline-support';
import type { BaselineMinVersions } from '@repo/helpers/browser/detect-browser';
import { type FC, type ReactNode, useCallback } from 'react';

import { BaselineNoticeModal } from './baseline-notice-modal';
import { BROWSER_BASELINE_MESSAGE } from './messages';
import {
  isBaselineNoticeForced,
  useDetectedBrowser,
} from './use-detected-browser';

const STORAGE_KEY = 'k8o:browser-baseline-notice-dismissed';

const LINK_CLASS =
  'text-primary-fg cursor-pointer underline underline-offset-2';

export const BrowserBaselineNotice: FC<{
  minVersions: BaselineMinVersions;
}> = ({ minVersions }) => {
  const detected = useDetectedBrowser();
  // 一度閉じたらそのセッション中は再表示しない(SessionStorage)。
  const [dismissed, setDismissed] = useSessionStorage(STORAGE_KEY, false);
  const modal = useDisclosure();

  // Alert.action.renderItem はレンダー毎に新規定義すると lint(nested components)に
  // 触れるため、安定参照にする。
  const renderDetailLink = useCallback(
    ({ children }: { children: ReactNode }): ReactNode => (
      <button className={LINK_CLASS} onClick={modal.open} type="button">
        {children}
      </button>
    ),
    [modal.open],
  );

  if (detected === null || !isBrowserOutdated(detected, minVersions)) {
    return null;
  }

  // dev の ?baseline-notice=force のときは、閉じた後でもプレビューできるよう
  // dismissed を無視する。
  if (dismissed && !isBaselineNoticeForced()) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-4">
      <Alert
        action={{ label: '詳しくはこちら', renderItem: renderDetailLink }}
        closeLabel="この通知を閉じる"
        message={BROWSER_BASELINE_MESSAGE}
        onClose={() => {
          setDismissed(true);
        }}
        tone="warning"
      />
      <BaselineNoticeModal
        detected={detected}
        isOpen={modal.isOpen}
        minVersions={minVersions}
        onClose={modal.close}
      />
    </div>
  );
};
