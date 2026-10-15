import { MockLanguageModelV4 } from 'ai/test';
import { after } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  insertUsageWithinLimits,
  selectCostSinceMicroUsd,
  updateUsageCost,
} from '@/features/usage/infrastructure/usage-repository';
import { requireAllowedSession } from '@/shared/auth/require-allowed-session';
import { getGenerationModel } from '@/shared/claude/claude-provider';

import { handleGenerate } from './generate';

vi.mock('server-only', () => ({}));
vi.mock('next/server', () => ({ after: vi.fn() }));
vi.mock('@/shared/auth/require-allowed-session', () => ({
  requireAllowedSession: vi.fn(),
}));
vi.mock('@/shared/claude/claude-provider', () => ({
  getGenerationModel: vi.fn(),
}));
vi.mock('@/features/usage/infrastructure/usage-repository', () => ({
  insertUsageWithinLimits: vi.fn(),
  selectCostSinceMicroUsd: vi.fn(),
  updateUsageCost: vi.fn(),
}));

const usage = {
  inputTokens: { total: 1200, noCache: 300, cacheRead: 800, cacheWrite: 100 },
  outputTokens: { total: 300, text: 300, reasoning: 0 },
};

// Claude の代役。hang は書き始めたところで止まって中断を待ち、中断されると実際の fetch と
// 同じく、読み途中のストリームを中断の理由でエラーにする。fail は書き始めたところでストリームをエラーにする
const mockClaude = (
  outcome: 'finish' | 'hang' | 'fail',
): { model: MockLanguageModelV4; started: Promise<undefined> } => {
  const started = Promise.withResolvers<undefined>();
  const model = new MockLanguageModelV4({
    doStream: ({ abortSignal }) =>
      Promise.resolve({
        stream: new ReadableStream({
          start(controller) {
            controller.enqueue({ type: 'stream-start', warnings: [] });
            controller.enqueue({ type: 'text-start', id: 't' });
            controller.enqueue({
              type: 'text-delta',
              id: 't',
              delta: '# 表紙',
            });
            started.resolve(undefined);
            if (outcome === 'fail') {
              controller.error(new Error('overloaded'));
              return;
            }
            if (outcome === 'hang') {
              abortSignal?.addEventListener('abort', () => {
                controller.error(abortSignal.reason);
              });
              return;
            }
            controller.enqueue({ type: 'text-end', id: 't' });
            controller.enqueue({
              type: 'finish',
              finishReason: { unified: 'stop', raw: 'end_turn' },
              usage,
            });
            controller.close();
          },
        }),
      }),
  });
  vi.mocked(getGenerationModel).mockReturnValue(model);
  return { model, started: started.promise };
};

const generateRequest = (body: unknown, signal?: AbortSignal): Request =>
  new Request('https://ai.k8o.me/api/generate', {
    method: 'POST',
    body: JSON.stringify(body),
    ...(signal === undefined ? {} : { signal }),
  });

const slidesBody = {
  mode: 'slides',
  messages: [
    { id: 'm1', role: 'user', parts: [{ type: 'text', text: '表紙を作って' }] },
  ],
};

beforeEach(() => {
  vi.useFakeTimers({
    toFake: ['Date'],
    now: Date.parse('2026-10-13T12:00:00.000Z'),
  });
  vi.mocked(requireAllowedSession).mockResolvedValue({ userId: 'u1' });
  vi.mocked(insertUsageWithinLimits).mockResolvedValue(7);
  vi.mocked(selectCostSinceMicroUsd).mockResolvedValue(0);
  vi.mocked(updateUsageCost).mockResolvedValue();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe('handleGenerate', () => {
  describe('正常系', () => {
    it('Claude を呼ぶ前に、頼んだモデルと生成の種類で、1時間あたりの上限と月の予算を条件に利用の行を予約する', async () => {
      vi.stubEnv('AI_GENERATE_LIMIT_PER_HOUR', '5');
      const { model } = mockClaude('finish');

      const response = await handleGenerate(
        generateRequest({ ...slidesBody, model: 'claude-opus-5-5' }),
      );
      await response.text();

      expect(response.status).toBe(200);
      expect(insertUsageWithinLimits).toHaveBeenCalledExactlyOnceWith({
        app: 'slides',
        kind: 'generation',
        userId: 'u1',
        model: 'claude-opus-5-5',
        createdAt: '2026-10-13T12:00:00.000Z',
        sinceIso: '2026-10-13T11:00:00.000Z',
        limit: 5,
        monthStartIso: '2026-10-01T00:00:00.000Z',
        budgetMicroUsd: 100_000_000,
      });
      expect(getGenerationModel).toHaveBeenCalledExactlyOnceWith(
        'claude-opus-5-5',
      );
      expect(model.doStreamCalls).toHaveLength(1);
    });

    it('mode が無ければ ui-studio の枠で、model が無ければ Sonnet 5.5 で予約する', async () => {
      mockClaude('finish');

      const response = await handleGenerate(
        generateRequest({ messages: slidesBody.messages }),
      );
      await response.text();

      expect(insertUsageWithinLimits).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          app: 'ui-studio',
          model: 'claude-sonnet-5-5',
        }),
      );
    });

    it('生成が終わったら、予約した行にキャッシュの内訳とモデルの単価で数えた費用を書く処理を after に載せる', async () => {
      mockClaude('finish');

      const response = await handleGenerate(generateRequest(slidesBody));
      await response.text();

      expect(after).toHaveBeenCalledOnce();
      await vi.mocked(after).mock.calls[0]?.[0];
      expect(updateUsageCost).toHaveBeenCalledExactlyOnceWith({
        id: 7,
        inputTokens: 1200,
        outputTokens: 300,
        cacheReadTokens: 800,
        cacheWriteTokens: 100,
        costMicroUsd: 4010,
      });
    });
  });

  describe('異常系', () => {
    it('1時間あたりの上限で予約できなければ、Claude を呼ばずに上限の文言で 429 を返す', async () => {
      const { model } = mockClaude('finish');
      vi.mocked(insertUsageWithinLimits).mockResolvedValue(null);
      vi.mocked(selectCostSinceMicroUsd).mockResolvedValue(99_999_999);

      const response = await handleGenerate(generateRequest(slidesBody));

      expect(response.status).toBe(429);
      await expect(response.text()).resolves.toBe(
        '1時間あたりの上限に達しました。しばらく待ってから送ってください。',
      );
      expect(model.doStreamCalls).toHaveLength(0);
    });

    it('月の予算に達して予約できなければ、Claude を呼ばずに予算の文言で 429 を返す', async () => {
      const { model } = mockClaude('finish');
      vi.mocked(insertUsageWithinLimits).mockResolvedValue(null);
      vi.mocked(selectCostSinceMicroUsd).mockResolvedValue(100_000_000);

      const response = await handleGenerate(generateRequest(slidesBody));

      expect(response.status).toBe(429);
      await expect(response.text()).resolves.toBe(
        '今月の利用額が上限（$100）に達しました。翌月1日（UTC）まで使えません。',
      );
      expect(model.doStreamCalls).toHaveLength(0);
    });

    it('未許可の利用者は 401 で弾き、予約しない', async () => {
      vi.mocked(requireAllowedSession).mockResolvedValue(null);

      const response = await handleGenerate(generateRequest(slidesBody));

      expect(response.status).toBe(401);
      expect(insertUsageWithinLimits).not.toHaveBeenCalled();
    });

    it('壊れたメッセージは 400 で弾き、上限の枠を使わない', async () => {
      const response = await handleGenerate(
        generateRequest({ mode: 'slides', messages: [{ role: 'user' }] }),
      );

      expect(response.status).toBe(400);
      expect(insertUsageWithinLimits).not.toHaveBeenCalled();
    });
  });

  describe('エッジケース', () => {
    it('生成の途中で中断されても、予約した行の更新を after に載せる（終わったステップが無ければ0円）', async () => {
      const { started } = mockClaude('hang');
      const controller = new AbortController();

      const response = await handleGenerate(
        generateRequest(slidesBody, controller.signal),
      );
      await started;
      controller.abort();
      await response.text();

      expect(after).toHaveBeenCalledOnce();
      await vi.mocked(after).mock.calls[0]?.[0];
      expect(updateUsageCost).toHaveBeenCalledExactlyOnceWith({
        id: 7,
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        costMicroUsd: 0,
      });
    });

    it('エラーで終わった生成は、予約した行に費用を書かない（行は枠として残る）', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mockClaude('fail');

      const response = await handleGenerate(generateRequest(slidesBody));
      await expect(response.text()).rejects.toThrow('overloaded');

      expect(insertUsageWithinLimits).toHaveBeenCalledOnce();
      expect(updateUsageCost).not.toHaveBeenCalled();
      expect(after).not.toHaveBeenCalled();
    });
  });
});
