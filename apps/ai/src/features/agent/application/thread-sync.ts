import type { ChatOnFinishCallback } from 'ai';

import type { AgentUIMessage } from './agent-message';
import type { ThreadSnapshot } from './threads';

type ChatFinish = Parameters<ChatOnFinishCallback<AgentUIMessage>>[0];

// 'wait' はサーバーの生成が終わるまで読み続け、'check' は1回だけ読んで生成中なら 'wait' に移る
export type ServerSync = 'wait' | 'check';

// 最後まで受け取れたときは、SSE が閉じる前にサーバーが保存を終えているので読み直さない。
// 切断でないエラーは送信を断られた（4xx）ときを含み、サーバーで生成していない見込みが高いので、待たずに1回だけ確かめる。
// SDK は切断のときも isError を立てるので、isDisconnect を先に見る
export const serverSyncAfter = (finish: ChatFinish): ServerSync | null => {
  if (finish.isDisconnect) {
    return 'wait';
  }
  if (finish.isError) {
    return 'check';
  }
  if (finish.isAbort || finish.finishReason === undefined) {
    return 'wait';
  }
  return null;
};

// 送った直後に切れると、サーバーがスレッドを作る前に読むことがあるので、1回の 404 では諦めない
const MAX_NOT_FOUND = 5;

export type ThreadRead =
  | { type: 'snapshot'; snapshot: ThreadSnapshot }
  // count は、この同期で 404 を読んだ回数（今回を含む）
  | { type: 'not-found'; count: number }
  | { type: 'unauthorized' }
  | { type: 'failed' };

// settle の null は、読めないまま諦めたこと（今のメッセージをそのまま残す）を表す
export type SyncStep =
  | { type: 'settle'; messages: AgentUIMessage[] | null }
  | { type: 'wait' }
  | { type: 'retry' };

export const nextSyncStep = (mode: ServerSync, read: ThreadRead): SyncStep => {
  switch (read.type) {
    case 'unauthorized':
      return { type: 'settle', messages: null };
    case 'not-found':
      return mode === 'check' || read.count >= MAX_NOT_FOUND
        ? { type: 'settle', messages: [] }
        : { type: 'retry' };
    case 'snapshot':
      if (!read.snapshot.running) {
        return { type: 'settle', messages: read.snapshot.messages };
      }
      return mode === 'check' ? { type: 'wait' } : { type: 'retry' };
    case 'failed':
      return mode === 'check' ? { type: 'wait' } : { type: 'retry' };
  }
};
