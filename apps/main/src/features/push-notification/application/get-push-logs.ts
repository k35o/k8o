import { findPushLogs } from '../infrastructure/push-log-repository';

const HISTORY_LIMIT = 50;

export const getPushLogs = () => findPushLogs(HISTORY_LIMIT);
