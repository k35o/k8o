import type { FinishReason, UIMessageStreamOutcome } from 'ai';
import { describe, expect, it } from 'vitest';

import type { AgentUIMessage, RunEnd } from './agent-message';
import { endOfFinish, isRunActive, withRunEnd } from './agent-run';

const now = Date.parse('2026-10-14T12:00:00.000Z');

const message = (metadata?: AgentUIMessage['metadata']): AgentUIMessage => ({
  id: 'a1',
  role: 'assistant',
  parts: [{ type: 'text', text: '途中まで' }],
  ...(metadata === undefined ? {} : { metadata }),
});

describe('isRunActive', () => {
  describe('正常系', () => {
    it('実行の印があり、生存の印が 30 秒以内なら実行中とみなす', () => {
      expect(
        isRunActive(
          { runId: 'run-1', runHeartbeatAt: '2026-10-14T11:59:58.000Z' },
          now,
        ),
      ).toBe(true);
    });

    it('実行の印が無ければ実行中ではない', () => {
      expect(isRunActive({ runId: null, runHeartbeatAt: null }, now)).toBe(
        false,
      );
    });
  });

  describe('エッジケース', () => {
    it('生存の印がちょうど 30 秒前なら実行中、それより前なら落ちたとみなす', () => {
      expect(
        isRunActive(
          { runId: 'run-1', runHeartbeatAt: '2026-10-14T11:59:30.000Z' },
          now,
        ),
      ).toBe(true);
      expect(
        isRunActive(
          { runId: 'run-1', runHeartbeatAt: '2026-10-14T11:59:29.999Z' },
          now,
        ),
      ).toBe(false);
    });
  });
});

describe('endOfFinish', () => {
  describe('正常系', () => {
    it.each<[FinishReason, RunEnd]>([
      ['stop', 'completed'],
      ['content-filter', 'refused'],
      ['length', 'length'],
      ['error', 'failed'],
      ['other', 'failed'],
    ])('finishReason が %s なら %s', (finishReason, end) => {
      expect(endOfFinish(finishReason, false)).toBe(end);
    });

    it('tool を呼んだステップで打ち切られたとき、予算を超えていなければステップの上限とみなす', () => {
      expect(endOfFinish('tool-calls', false)).toBe('step-limit');
    });

    it('tool を呼んだステップで打ち切られたとき、予算を超えていれば予算とみなす', () => {
      expect(endOfFinish('tool-calls', true)).toBe('budget');
    });
  });

  describe('エッジケース', () => {
    it('予算を超えていても、tool を呼ばずに答え終えたなら完了とみなす', () => {
      expect(endOfFinish('stop', true)).toBe('completed');
    });
  });
});

describe('withRunEnd', () => {
  describe('正常系', () => {
    it('利用者の停止で中断した返答には stopped を付ける', () => {
      expect(
        withRunEnd(message(), {
          outcome: { status: 'aborted' },
          stopRequested: true,
        }),
      ).toStrictEqual(message({ end: 'stopped' }));
    });

    it('停止の要求なしに中断した返答（時間の上限）には timeout を付ける', () => {
      expect(
        withRunEnd(message(), {
          outcome: { status: 'aborted' },
          stopRequested: false,
        }),
      ).toStrictEqual(message({ end: 'timeout' }));
    });

    it.each<UIMessageStreamOutcome>([
      { status: 'failed', error: new Error('overloaded') },
      { status: 'unknown' },
    ])('outcome が $status なら failed を付ける', (outcome) => {
      expect(
        withRunEnd(message(), { outcome, stopRequested: false }),
      ).toStrictEqual(message({ end: 'failed' }));
    });
  });

  describe('エッジケース', () => {
    it('finish で終わり方が付いていれば、outcome によらず変えない', () => {
      expect(
        withRunEnd(message({ end: 'failed' }), {
          outcome: { status: 'completed' },
          stopRequested: false,
        }),
      ).toStrictEqual(message({ end: 'failed' }));
    });
  });
});
