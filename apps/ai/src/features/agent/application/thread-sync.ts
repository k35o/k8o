import type { ChatOnFinishCallback, ChatStatus } from 'ai';

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

const SYNC_INTERVAL_MS = 2000;
const STOPPING_SYNC_INTERVAL_MS = 500;

// 停止を送ったあとは、保存された返答へ早く置き換えるよう、生成中と読めたときだけ短い間隔で読み直す。
// 404 と読めなかったときは、スレッドができるのを待つ幅と失敗のあとの間隔を縮めないよう、いつもの間隔のまま
export const syncRetryDelayMs = (input: {
  stopSent: boolean;
  read: ThreadRead;
}): number =>
  input.stopSent && input.read.type === 'snapshot'
    ? STOPPING_SYNC_INTERVAL_MS
    : SYNC_INTERVAL_MS;

// 押した停止の段階。'deferred' は応答が流れ始めるのを待っている、'sent' は送る（送った）
export type StopRequest = 'deferred' | 'sent';

// サーバーは実行の印を付けて user メッセージを保存してから応答を流し、印が付く前に届いた停止は捨てるので、
// 応答が流れ始める前（submitted）に押された停止は、流れ始めるまで送らない
export const stopRequestOnPress = (status: ChatStatus): StopRequest =>
  status === 'submitted' ? 'deferred' : 'sent';

// 流れ始めずに終わったら、印が付いたか分からないので送らずに取り下げる（断られたなら生成していない。
// 切れたなら、サーバーの生成を待つあいだにもう一度押せる）
export const deferredStopAfter = (status: ChatStatus): StopRequest | null => {
  switch (status) {
    case 'submitted':
      return 'deferred';
    case 'streaming':
      return 'sent';
    case 'ready':
    case 'error':
      return null;
  }
};

// 押したことと今の受信・同期から導くので、停止が自然な終わりと競って読み直さずに済んだときにも残らない
export const isStopping = (input: {
  request: StopRequest | null;
  status: ChatStatus;
  sync: ServerSync | null;
}): boolean =>
  input.request !== null &&
  (input.status === 'submitted' ||
    input.status === 'streaming' ||
    input.sync === 'wait');

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
