import { findPublicPushLogs } from '../infrastructure/push-log-repository';

const PUSH_LOG_HISTORY_LIMIT = 50;

export const getPublicPushLogs = async (): Promise<{
  logs: Awaited<ReturnType<typeof findPublicPushLogs>>;
}> => ({ logs: await findPublicPushLogs(PUSH_LOG_HISTORY_LIMIT) });
