import { cacheLife } from 'next/cache';

import { getPushLogs as _getPushLogs } from '../application/get-push-logs';

export async function getPushLogs() {
  'use cache';
  // 通知は admin 側の送信後に追加されるため、短時間で再検証される一覧として扱う
  cacheLife('minutes');

  const logs = await _getPushLogs();
  return logs;
}
