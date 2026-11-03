import { defineMemoryState } from '@k8ordo/state';

export const noticeState = defineMemoryState('browser-support-notice', {
  dismissed: false,
});
