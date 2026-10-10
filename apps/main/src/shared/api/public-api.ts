import type { PublicApi } from '@repo/api/public';
import { hc } from 'hono/client';

const LOCAL_MAIN_HOST = /(?:^|\.)main\.k8o\.localhost$/u;

// ローカル（portless）では同じ worktree の api を呼ぶ。ホスト名から導くので、worktree の
// ブランチ名の前置もプロキシのポートも合う。preview の main は本番の api に Origin で
// 拒否されて書き込まれない
const apiOrigin = (): string => {
  if (
    typeof location !== 'undefined' &&
    LOCAL_MAIN_HOST.test(location.hostname)
  ) {
    return `${location.protocol}//${location.host.replace('main.k8o.localhost', 'api.k8o.localhost')}`;
  }
  return 'https://api.k8o.me';
};

type FetchInput = Parameters<typeof fetch>[0];
type FetchInit = Parameters<typeof fetch>[1];

// Next の useOffline が接続の確認に使う間隔にそろえる
const RECONNECT_RETRY_DELAYS_MS = [500, 1000, 2000, 3000] as const;

const waitForOnline = (): Promise<void> =>
  new Promise((resolve) => {
    window.addEventListener(
      'online',
      () => {
        resolve();
      },
      { once: true },
    );
  });

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const resendAfterReconnect = async (
  input: FetchInput,
  init: FetchInit,
  delays: readonly number[],
): Promise<Response> => {
  if (!navigator.onLine) {
    await waitForOnline();
  }
  try {
    return await fetch(input, init);
  } catch (error) {
    if (!navigator.onLine) {
      return resendAfterReconnect(input, init, delays);
    }
    // 接続が戻った直後は名前解決などがまだ通らないことがあるので、間を空けて数回やり直す
    const [delay, ...rest] = delays;
    if (delay === undefined) {
      throw error;
    }
    await sleep(delay);
    return resendAfterReconnect(input, init, rest);
  }
};

// ブラウザがオフラインの間に送れなかった書き込みは、失敗にせず接続が戻ってから送り直す。
// Server Action が experimental.useOffline で持っていた挙動で、OfflineNotice もそう案内する。
// オンラインのまま失敗したものは送り直さない（CORS で拒否されたときに止まらなくなるため）
const fetchRetryingWhenOffline: typeof fetch = async (input, init) => {
  try {
    return await fetch(input, init);
  } catch (error) {
    if (navigator.onLine) {
      throw error;
    }
    return resendAfterReconnect(input, init, RECONNECT_RETRY_DELAYS_MS);
  }
};

export const publicApi = hc<PublicApi>(apiOrigin(), {
  fetch: fetchRetryingWhenOffline,
});
