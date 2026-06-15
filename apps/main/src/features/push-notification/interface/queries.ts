import { cacheLife } from 'next/cache';

import { getPushLogs as _getPushLogs } from '../application/get-push-logs';

export async function getPushLogs() {
  'use cache';
  cacheLife('minutes');

  const logs = await _getPushLogs();
  return logs;
}
