import { PUSH_LOG_HISTORY_LIMIT } from '@repo/helpers/push-log/history';

import { findPushLogs } from '../infrastructure/push-log-repository';

export const getPushLogs = () => findPushLogs(PUSH_LOG_HISTORY_LIMIT);
