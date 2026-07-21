'use client';

import type { DetectedBrowser } from '@repo/helpers/browser/detect-browser';
import { parseBrowserFromUserAgent } from '@repo/helpers/browser/detect-browser';
import { useSyncExternalStore } from 'react';

type UaDataBrand = { brand: string; version: string };
type UserAgentData = { brands: UaDataBrand[]; mobile: boolean };

const detectFromUaData = (uaData: UserAgentData): DetectedBrowser | null => {
  const edge = uaData.brands.find((b) => b.brand === 'Microsoft Edge');
  if (edge) {
    // Edge on Android はコアの 7 ブラウザに edge_android が無く、UA 文字列パス(EdgA/)でも
    // 対象外としているため、UA-CH パスでも除外して両経路の判定を揃える。
    return uaData.mobile ? null : { browser: 'edge', version: edge.version };
  }
  const chrome = uaData.brands.find((b) => b.brand === 'Google Chrome');
  if (chrome) {
    return {
      browser: uaData.mobile ? 'chrome_android' : 'chrome',
      version: chrome.version,
    };
  }
  return null;
};

const detectBrowser = (): DetectedBrowser | null => {
  const uaData = (navigator as Navigator & { userAgentData?: UserAgentData })
    .userAgentData;
  if (uaData && Array.isArray(uaData.brands)) {
    const detected = detectFromUaData(uaData);
    if (detected) {
      return detected;
    }
  }
  return parseBrowserFromUserAgent(navigator.userAgent);
};

// useSyncExternalStore に渡す snapshot は参照が安定している必要があるため、
// 検出結果を一度だけ計算してモジュールスコープにキャッシュする。
let detectionComputed = false;
let detectedSnapshot: DetectedBrowser | null = null;

const subscribe = (): (() => void) => () => {};

// dev 限定の確認用: ?browser-support-notice=force を付けると、最新ブラウザでも
// 古い扱い(version 0)にして警告の見た目を実アプリ上で確認できる。本番では無効。
const FORCED_OUTDATED: DetectedBrowser = { browser: 'chrome', version: '0' };

export const isNoticeForced = (): boolean =>
  process.env['NODE_ENV'] === 'development' &&
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('browser-support-notice') ===
    'force';

const getClientSnapshot = (): DetectedBrowser | null => {
  if (!detectionComputed) {
    detectedSnapshot = isNoticeForced() ? FORCED_OUTDATED : detectBrowser();
    detectionComputed = true;
  }
  return detectedSnapshot;
};

const getServerSnapshot = (): DetectedBrowser | null => null;

// SSR では null を返し、ハイドレーション後にクライアントで一度だけ検出する。
export const useDetectedBrowser = (): DetectedBrowser | null =>
  useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
