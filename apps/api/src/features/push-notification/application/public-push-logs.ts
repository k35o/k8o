import { findPublicPushLogs } from '../infrastructure/push-log-repository';

const PUSH_LOG_HISTORY_LIMIT = 50;

export const getPublicPushLogs = (): ReturnType<typeof findPublicPushLogs> =>
  findPublicPushLogs(PUSH_LOG_HISTORY_LIMIT);
