import { describe, expect, it } from 'vitest';

import type { AgentUIMessage } from './agent-message';
import {
  createdAtAfterSync,
  deferredStopAfter,
  isStopping,
  nextSyncStep,
  serverSyncAfter,
  stopRequestAfterFailedSend,
  stopRequestOnPress,
  syncRetryDelayMs,
  unsavedUserText,
} from './thread-sync';

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
  // Safari の 'Load failed' のように、SDK が切断とみなさない通信の失敗。HTTP で断られたときも同じ形
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
      expect(serverSyncAfter(finishes.completed, false)).toBeNull();
    });

    it.each([
      ['停止した', finishes.stopped],
      ['回線が切れた', finishes.disconnected],
    ])('%sなら、サーバーの生成が終わるまで待つ', (_label, finish) => {
      expect(serverSyncAfter(finish, false)).toBe('wait');
    });
  });

  describe('異常系', () => {
    it('HTTP の応答で断られたら、待たずに1回だけ確かめる', () => {
      expect(serverSyncAfter(finishes.failed, true)).toBe('check');
    });

    it('SDK が切断とみなさない通信の失敗やストリームのエラーでは、サーバーの生成が終わるまで待つ', () => {
      expect(serverSyncAfter(finishes.failed, false)).toBe('wait');
    });
  });

  describe('エッジケース', () => {
    it('finish を受け取らずにストリームが閉じたなら、サーバーの生成が終わるまで待つ', () => {
      expect(serverSyncAfter(finishes.closedWithoutFinish, false)).toBe('wait');
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
      expect(serverSyncAfter(finishes.disconnected, false)).toBe('wait');
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

describe('syncRetryDelayMs', () => {
  const running = {
    type: 'snapshot',
    snapshot: { running: true },
  } as const;

  describe('正常系', () => {
    it('停止を送っていなければ、生成中でも2秒おきに読む', () => {
      expect(syncRetryDelayMs({ stopSent: false, read: running })).toBe(2000);
    });

    it('停止を送ったあと生成中と読めたら、0.5秒おきに読む', () => {
      expect(syncRetryDelayMs({ stopSent: true, read: running })).toBe(500);
    });
  });

  describe('エッジケース', () => {
    it('停止を送ったあとでも、404 なら2秒おきに読み、スレッドができるのを待つ幅を縮めない', () => {
      expect(
        syncRetryDelayMs({
          stopSent: true,
          read: { type: 'not-found', count: 1 },
        }),
      ).toBe(2000);
    });

    it('停止を送ったあとでも、読めなかったら2秒おきに読む', () => {
      expect(
        syncRetryDelayMs({ stopSent: true, read: { type: 'failed' } }),
      ).toBe(2000);
    });
  });
});

describe('stopRequestOnPress', () => {
  describe('正常系', () => {
    it('応答が流れているあいだに押したら、すぐ送る', () => {
      expect(stopRequestOnPress('streaming')).toBe('sent');
    });

    it.each(['ready', 'error'] as const)(
      '受信を終えてサーバーの生成を待っているあいだ（%s）に押したら、停止を送ったあとの押し直しでも、すぐ送る',
      (status) => {
        expect(stopRequestOnPress(status)).toBe('sent');
      },
    );
  });

  describe('エッジケース', () => {
    it('応答が流れ始める前に押したら、サーバーが実行の印を付けるまで送らずに待つ', () => {
      expect(stopRequestOnPress('submitted')).toBe('deferred');
    });
  });
});

describe('deferredStopAfter', () => {
  describe('正常系', () => {
    it('応答が流れ始めたら、待っていた停止を送る', () => {
      expect(deferredStopAfter('streaming')).toBe('released');
    });

    it('まだ流れ始めていなければ、待ち続ける', () => {
      expect(deferredStopAfter('submitted')).toBe('deferred');
    });
  });

  describe('異常系', () => {
    it.each(['error', 'ready'] as const)(
      '流れ始めずに終わったら（%s）、送らずに取り下げる',
      (status) => {
        expect(deferredStopAfter(status)).toBeNull();
      },
    );
  });
});

describe('stopRequestAfterFailedSend', () => {
  describe('異常系', () => {
    it.each(['sent', 'released'] as const)(
      '送った停止（%s）が届かなかったら、取り下げてもう一度押せるようにする',
      (request) => {
        expect(stopRequestAfterFailedSend(request)).toBeNull();
      },
    );
  });

  describe('エッジケース', () => {
    it('届かないうちに次の送信で、流れ始めを待つ停止に変わっていたら、それは残す', () => {
      expect(stopRequestAfterFailedSend('deferred')).toBe('deferred');
    });

    it('届かないうちに次の送信で取り下げられていたら、取り下げたまま', () => {
      expect(stopRequestAfterFailedSend(null)).toBeNull();
    });
  });
});

describe('isStopping', () => {
  describe('正常系', () => {
    it('応答が流れ始める前に押したら、流れ始めるのを待つあいだも停止中とする', () => {
      expect(
        isStopping({ request: 'deferred', status: 'submitted', sync: null }),
      ).toBe(true);
    });

    it('停止を送って受信を止めたら、サーバーの生成が終わるのを待つあいだも停止中とする', () => {
      expect(
        isStopping({ request: 'sent', status: 'ready', sync: 'wait' }),
      ).toBe(true);
    });

    it('サーバーの生成が終わったと分かったら（停止より先に最後まで受け取れて読み直さなかったときも）、停止中ではない', () => {
      expect(isStopping({ request: 'sent', status: 'ready', sync: null })).toBe(
        false,
      );
    });

    it('停止を押していなければ、受信中でも停止中ではない', () => {
      expect(
        isStopping({ request: null, status: 'streaming', sync: null }),
      ).toBe(false);
    });
  });

  describe('エッジケース', () => {
    it('待っていた停止を送る前に応答が流れ始めても、停止中のまま', () => {
      expect(
        isStopping({ request: 'deferred', status: 'streaming', sync: null }),
      ).toBe(true);
    });
  });
});

describe('createdAtAfterSync', () => {
  const firstSentAt = '2026-10-14T01:00:00.000Z';

  describe('正常系', () => {
    it('応答が流れ始める前に止めても、サーバーに保存されていれば、最初に送った時刻に作られたとみなす', () => {
      expect(
        createdAtAfterSync({
          createdAt: null,
          firstSentAt,
          saved: savedMessages,
        }),
      ).toBe(firstSentAt);
    });

    it('応答が流れ始めて作られたスレッドは、作られた時刻を変えない', () => {
      expect(
        createdAtAfterSync({
          createdAt: '2026-10-14T00:00:00.000Z',
          firstSentAt,
          saved: savedMessages,
        }),
      ).toBe('2026-10-14T00:00:00.000Z');
    });
  });

  describe('異常系', () => {
    it('サーバーに何も保存されていなければ、作られていないとみなす', () => {
      expect(
        createdAtAfterSync({ createdAt: null, firstSentAt, saved: [] }),
      ).toBeNull();
    });

    it('読めないまま諦めたら、作られていないとみなす', () => {
      expect(
        createdAtAfterSync({ createdAt: null, firstSentAt, saved: null }),
      ).toBeNull();
    });
  });

  describe('エッジケース', () => {
    it('このタブで送っていないスレッドは、読み直しただけでは作られたとみなさない', () => {
      expect(
        createdAtAfterSync({
          createdAt: null,
          firstSentAt: null,
          saved: savedMessages,
        }),
      ).toBeNull();
    });
  });
});

describe('unsavedUserText', () => {
  const firstQuestion: AgentUIMessage = {
    id: 'u1',
    role: 'user',
    parts: [{ type: 'text', text: 'こんにちは' }],
  };
  const refusedQuestion: AgentUIMessage = {
    id: 'u2',
    role: 'user',
    parts: [{ type: 'text', text: 'ariaNotify の記事を\n要約して' }],
  };

  describe('正常系', () => {
    it('最後に送った本文がサーバーに保存されていなければ、その本文を返す', () => {
      expect(
        unsavedUserText(
          [firstQuestion, assistantMessage, refusedQuestion],
          [firstQuestion, assistantMessage],
        ),
      ).toBe('ariaNotify の記事を\n要約して');
    });

    it('最後に送った本文がサーバーに保存されていれば、何も返さない', () => {
      expect(
        unsavedUserText([firstQuestion, assistantMessage], savedMessages),
      ).toBeNull();
    });
  });

  describe('エッジケース', () => {
    it('新しいスレッドで、サーバーに何も無ければ、送った本文を返す', () => {
      expect(unsavedUserText([firstQuestion], [])).toBe('こんにちは');
    });

    it('送った本文が無ければ、何も返さない', () => {
      expect(unsavedUserText([], [])).toBeNull();
    });
  });
});
