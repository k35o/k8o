import { describe, expect, it } from 'vitest';

import type { AgentUIMessage } from './agent-message';
import { nextSyncStep, serverSyncAfter } from './thread-sync';

type ChatFinish = Parameters<typeof serverSyncAfter>[0];

const assistantMessage: AgentUIMessage = {
  id: 'a1',
  role: 'assistant',
  parts: [{ type: 'text', text: '途中まで' }],
};

const savedMessages: AgentUIMessage[] = [
  { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'こんにちは' }] },
  assistantMessage,
];

// AI SDK の AbstractChat が onFinish に渡す組み合わせ。finish を受け取る前に終わると
// finishReason は無い
const finishes = {
  completed: {
    message: assistantMessage,
    messages: [],
    isAbort: false,
    isDisconnect: false,
    isError: false,
    finishReason: 'stop',
  },
  stopped: {
    message: assistantMessage,
    messages: [],
    isAbort: true,
    isDisconnect: false,
    isError: false,
  },
  // fetch の TypeError（'Failed to fetch' など）で落ちた
  disconnected: {
    message: assistantMessage,
    messages: [],
    isAbort: false,
    isDisconnect: true,
    isError: true,
  },
  // 4xx で断られた、またはストリームの error で終わった
  failed: {
    message: assistantMessage,
    messages: [],
    isAbort: false,
    isDisconnect: false,
    isError: true,
  },
  closedWithoutFinish: {
    message: assistantMessage,
    messages: [],
    isAbort: false,
    isDisconnect: false,
    isError: false,
  },
} satisfies Record<string, ChatFinish>;

describe('serverSyncAfter', () => {
  describe('正常系', () => {
    it('最後まで受け取れたなら、サーバーから読み直さない', () => {
      expect(serverSyncAfter(finishes.completed)).toBeNull();
    });

    it.each([
      ['停止した', finishes.stopped],
      ['回線が切れた', finishes.disconnected],
    ])('%sなら、サーバーの生成が終わるまで待つ', (_label, finish) => {
      expect(serverSyncAfter(finish)).toBe('wait');
    });
  });

  describe('異常系', () => {
    it('切断でないエラーで終わったら、待たずに1回だけ確かめる', () => {
      expect(serverSyncAfter(finishes.failed)).toBe('check');
    });
  });

  describe('エッジケース', () => {
    it('finish を受け取らずにストリームが閉じたなら、サーバーの生成が終わるまで待つ', () => {
      expect(serverSyncAfter(finishes.closedWithoutFinish)).toBe('wait');
    });
  });
});

describe('nextSyncStep', () => {
  describe('正常系', () => {
    it.each(['wait', 'check'] as const)(
      '%s で生成が終わっていたら、サーバーのメッセージに合わせる',
      (mode) => {
        expect(
          nextSyncStep(mode, {
            type: 'snapshot',
            snapshot: { running: false, messages: savedMessages },
          }),
        ).toStrictEqual({ type: 'settle', messages: savedMessages });
      },
    );

    it('wait で生成中なら、また読む', () => {
      expect(
        nextSyncStep('wait', { type: 'snapshot', snapshot: { running: true } }),
      ).toStrictEqual({ type: 'retry' });
    });

    it('check で生成中なら、wait に移る', () => {
      expect(
        nextSyncStep('check', {
          type: 'snapshot',
          snapshot: { running: true },
        }),
      ).toStrictEqual({ type: 'wait' });
    });
  });

  describe('異常系', () => {
    it.each(['wait', 'check'] as const)(
      '%s で 401 なら、読むのをやめて今のメッセージを残す',
      (mode) => {
        expect(nextSyncStep(mode, { type: 'unauthorized' })).toStrictEqual({
          type: 'settle',
          messages: null,
        });
      },
    );

    it('check で 404 なら、会話は作られていないとみなして空にする', () => {
      expect(
        nextSyncStep('check', { type: 'not-found', count: 1 }),
      ).toStrictEqual({ type: 'settle', messages: [] });
    });

    it('wait で読めなければ、また読む', () => {
      expect(nextSyncStep('wait', { type: 'failed' })).toStrictEqual({
        type: 'retry',
      });
    });

    it('check で読めなければ、生成中かもしれないので wait に移る', () => {
      expect(nextSyncStep('check', { type: 'failed' })).toStrictEqual({
        type: 'wait',
      });
    });

    it('新しいスレッドで送った直後に回線が切れたら、スレッドができる前の 404 では諦めずに読み直す', () => {
      expect(serverSyncAfter(finishes.disconnected)).toBe('wait');
      expect(
        nextSyncStep('wait', { type: 'not-found', count: 1 }),
      ).toStrictEqual({ type: 'retry' });
    });
  });

  describe('エッジケース', () => {
    it('wait の 404 は、4回目までは読み直す', () => {
      expect(
        nextSyncStep('wait', { type: 'not-found', count: 4 }),
      ).toStrictEqual({ type: 'retry' });
    });

    it('wait の 404 が5回続いたら、会話は作られていないとみなして空にする', () => {
      expect(
        nextSyncStep('wait', { type: 'not-found', count: 5 }),
      ).toStrictEqual({ type: 'settle', messages: [] });
    });
  });
});
