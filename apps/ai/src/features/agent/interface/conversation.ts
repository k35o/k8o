// 会話の画面（クライアントの部品）が読む、DB にもサーバーにも触れない関数と型
export { messageTextOf, threadTitleFrom } from '../application/agent-message';
export type { AgentUIMessage, RunEnd } from '../application/agent-message';
export { MAX_STEPS } from '../application/agent-run';
export {
  artifactLiveOf,
  chatArtifactsOf,
  lastCallKeyOf,
  paneVersionsOf,
  shownArtifact,
} from '../application/chat-artifacts';
export type {
  ChatArtifact,
  PaneArtifact,
  PaneSelection,
  PaneVersion,
} from '../application/chat-artifacts';
export {
  createdAtAfterSync,
  deferredStopAfter,
  isStopping,
  nextSyncStep,
  serverSyncAfter,
  stopRequestAfterFailedSend,
  stopRequestOnPress,
  syncRetryDelayMs,
  unsavedUserText,
} from '../application/thread-sync';
export type {
  ServerSync,
  StopRequest,
  ThreadRead,
} from '../application/thread-sync';
export { withTouchedThreads } from '../application/touched-threads';
export { WITHHELD_OUTPUT_TEXT } from '../application/withhold-tool-outputs';
