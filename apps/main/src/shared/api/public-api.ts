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

export const publicApi = hc<PublicApi>(apiOrigin());
