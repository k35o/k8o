import { cacheLife } from 'next/cache';

import {
  findPushLogs,
  findPushOverview,
} from '../infrastructure/push-repository';
import type {
  FindPushLogsParams,
  FindPushLogsResult,
  PushOverview,
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
