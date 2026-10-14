import 'server-only';
import { touchRunHeartbeat } from '../infrastructure/thread-repository';
import { STOP_POLL_MS } from './agent-run';

// 停止の要求は別の関数の呼び出し（停止 API）に届くので、DB を読んで受け取る。
// 同じ読み取りで生存の印も更新し、落ちた実行の印をほかの要求が取り直せるようにする
export const watchStopRequest = (input: {
  threadId: string;
  runId: string;
  signal: AbortSignal;
  onStop: () => void;
}): void => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopRequested = false;

  const poll = async (): Promise<void> => {
    const run = await touchRunHeartbeat({
      threadId: input.threadId,
      runId: input.runId,
      heartbeatAt: new Date().toISOString(),
    }).catch((error: unknown) => {
      console.error('停止の要求を確かめられませんでした', error);
      return undefined;
    });
    if (input.signal.aborted || run === null) {
      return;
    }
    if (run?.stopRequested === true && !stopRequested) {
      stopRequested = true;
      input.onStop();
    }
    // 読み取りが重ならないよう、前の読み取りが終わってから次を予約する
    timer = setTimeout(() => void poll(), STOP_POLL_MS);
  };

  if (input.signal.aborted) {
    return;
  }
  input.signal.addEventListener(
    'abort',
    () => {
      clearTimeout(timer);
    },
    { once: true },
  );
  timer = setTimeout(() => void poll(), STOP_POLL_MS);
};
