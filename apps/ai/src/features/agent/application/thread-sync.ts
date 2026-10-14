import type { ChatOnFinishCallback } from 'ai';

import type { AgentUIMessage } from './agent-message';
import type { ThreadSnapshot } from './threads';

type ChatFinish = Parameters<ChatOnFinishCallback<AgentUIMessage>>[0];

// 'wait' はサーバーの生成が終わるまで読み続け、'check' は1回だけ読んで生成中なら 'wait' に移る
export type ServerSync = 'wait' | 'check';

// 最後まで受け取れたときは、SSE が閉じる前にサーバーが保存を終えているので読み直さない。
// HTTP の応答で断られた（rejected）ときはサーバーで生成していない見込みが高いので、待たずに1回だけ確かめる。
// 通信の失敗は SDK の isDisconnect では見分けきれない（Safari の 'Load failed' では立たない）ので、
// 応答で断られたか、それ以外のエラーかで分ける
export const serverSyncAfter = (
  finish: ChatFinish,
  rejected: boolean,
): ServerSync | null => {
  if (finish.isError) {
    return rejected ? 'check' : 'wait';
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

// 新しいスレッドは応答が流れ始めた時点で作られたとみなすが、流れ始める前に止めたり切れたりしても
// サーバーに保存されていれば作られている
export const createdAtAfterSync = (input: {
  createdAt: string | null;
  firstSentAt: string | null;
  saved: AgentUIMessage[] | null;
}): string | null => {
  if (
    input.createdAt !== null ||
    input.saved === null ||
    input.saved.length === 0
  ) {
    return input.createdAt;
  }
  return input.firstSentAt;
};

// サーバーはクライアントが付けた id のまま保存するので、id で保存されたかを見る
export const unsavedUserText = (
  local: AgentUIMessage[],
  saved: AgentUIMessage[],
): string | null => {
  const lastUser = local.findLast((message) => message.role === 'user');
  if (
    lastUser === undefined ||
    saved.some((message) => message.id === lastUser.id)
  ) {
    return null;
  }
  return lastUser.parts
    .flatMap((part) => (part.type === 'text' ? [part.text] : []))
    .join('\n');
};
