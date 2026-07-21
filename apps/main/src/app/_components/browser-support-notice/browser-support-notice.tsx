'use client';

import { Alert, useDisclosure, useSessionStorage } from '@k8o/arte-odyssey';
import { isBrowserOutdated } from '@repo/helpers/browser/browser-support';
import type { BrowserMinVersions } from '@repo/helpers/browser/detect-browser';
import { useCallback } from 'react';
import type { FC, ReactNode } from 'react';

import { BrowserSupportNoticeModal } from './browser-support-notice-modal';
import { BROWSER_SUPPORT_MESSAGE } from './messages';
import { isNoticeForced, useDetectedBrowser } from './use-detected-browser';

const STORAGE_KEY = 'k8o:browser-support-notice-dismissed';

const LINK_CLASS =
  'text-primary-fg cursor-pointer underline underline-offset-2';

export const BrowserSupportNotice: FC<{
  minVersions: BrowserMinVersions;
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

  // dev の ?browser-support-notice=force のときは、閉じた後でもプレビューできるよう
  // dismissed を無視する。
  if (dismissed && !isNoticeForced()) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-4">
      <Alert
        action={{ label: '詳しくはこちら', renderItem: renderDetailLink }}
        closeLabel="この通知を閉じる"
        message={BROWSER_SUPPORT_MESSAGE}
        onClose={() => {
          setDismissed(true);
        }}
        tone="warning"
      />
      <BrowserSupportNoticeModal
        detected={detected}
        isOpen={modal.isOpen}
        minVersions={minVersions}
        onClose={modal.close}
      />
    </div>
  );
};
