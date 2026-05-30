import { findPushLogs } from '../infrastructure/push-log-repository';

// 通知履歴ページに表示する最大件数
const HISTORY_LIMIT = 50;

export const getPushLogs = () => findPushLogs(HISTORY_LIMIT);
