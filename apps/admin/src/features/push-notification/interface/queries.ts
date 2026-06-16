import { cacheLife } from 'next/cache';

import {
  type FindPushLogsParams,
  type FindPushLogsResult,
  findPushLogs,
  findPushOverview,
  type PushOverview,
} from '../infrastructure/push-repository';

export const getPushOverview = async (): Promise<PushOverview> => {
  'use cache';
  cacheLife('minutes');

  const result = await findPushOverview();
  return result;
};

export const getPushLogs = async (
  params: FindPushLogsParams,
): Promise<FindPushLogsResult> => {
  'use cache';
  cacheLife('minutes');

  const result = await findPushLogs(params);
  return result;
};

export type {
  PushLogRecord,
  PushOverview,
} from '../infrastructure/push-repository';
