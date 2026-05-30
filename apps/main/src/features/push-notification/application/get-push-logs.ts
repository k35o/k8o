import {
  findPushLogs,
  type PublicPushLog,
} from '../infrastructure/push-log-repository';

export type PushLogView = PublicPushLog;

export const getPushLogs = (): Promise<PushLogView[]> => findPushLogs(50);
