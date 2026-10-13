import { MockLanguageModelV4 } from 'ai/test';
import { after } from 'next/server';

import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

import { getGenerationModel } from '../infrastructure/claude-provider';
import {
  reserveGenerationUsage,
  updateGenerationUsageTokens,
} from '../infrastructure/usage-repository';
import { handleGenerate } from './generate';

vi.mock('server-only', () => ({}));
vi.mock('next/server', () => ({ after: vi.fn() }));
vi.mock('@/shared/auth/require-allowed-session', () => ({
  requireAllowedSession: vi.fn(),
}));
vi.mock('../infrastructure/claude-provider', () => ({
  getGenerationModel: vi.fn(),
}));
vi.mock('../infrastructure/usage-repository', () => ({
  reserveGenerationUsage: vi.fn(),
  updateGenerationUsageTokens: vi.fn(),
}));

const usage = {
  inputTokens: { total: 120, noCache: 120, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 30, text: 30, reasoning: 0 },
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
  vi.mocked(reserveGenerationUsage).mockResolvedValue(7);
  vi.mocked(updateGenerationUsageTokens).mockResolvedValue();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe('handleGenerate', () => {
  describe('正常系', () => {
    it('Claude を呼ぶ前に、アプリと利用者ごとの1時間の上限で利用の行を予約する', async () => {
      vi.stubEnv('AI_GENERATE_LIMIT_PER_HOUR', '5');
      const { model } = mockClaude('finish');

      const response = await handleGenerate(generateRequest(slidesBody));
      await response.text();

      expect(response.status).toBe(200);
      expect(reserveGenerationUsage).toHaveBeenCalledWith({
        app: 'slides',
        userId: 'u1',
        createdAt: '2026-10-13T12:00:00.000Z',
        sinceIso: '2026-10-13T11:00:00.000Z',
        limit: 5,
      });
      expect(model.doStreamCalls).toHaveLength(1);
    });

    it('mode が無ければ ui-studio の枠で予約する', async () => {
      mockClaude('finish');

      const response = await handleGenerate(
        generateRequest({ messages: slidesBody.messages }),
      );
      await response.text();

      expect(reserveGenerationUsage).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ app: 'ui-studio' }),
      );
    });

    it('生成が終わったら、予約した行のトークン数の更新を after に載せる', async () => {
      mockClaude('finish');
      const update = Promise.resolve();
      vi.mocked(updateGenerationUsageTokens).mockReturnValue(update);

      const response = await handleGenerate(generateRequest(slidesBody));
      await response.text();

      expect(updateGenerationUsageTokens).toHaveBeenCalledExactlyOnceWith({
        id: 7,
        inputTokens: 120,
        outputTokens: 30,
      });
      expect(after).toHaveBeenCalledExactlyOnceWith(update);
    });
  });

  describe('異常系', () => {
    it('上限に達して予約できなければ、Claude を呼ばずに 429 を返す', async () => {
      const { model } = mockClaude('finish');
      vi.mocked(reserveGenerationUsage).mockResolvedValue(null);

      const response = await handleGenerate(generateRequest(slidesBody));

      expect(response.status).toBe(429);
      await expect(response.text()).resolves.toBe('Rate limit exceeded');
      expect(model.doStreamCalls).toHaveLength(0);
    });

    it('未許可の利用者は 401 で弾き、予約しない', async () => {
      vi.mocked(requireAllowedSession).mockResolvedValue(null);

      const response = await handleGenerate(generateRequest(slidesBody));

      expect(response.status).toBe(401);
      expect(reserveGenerationUsage).not.toHaveBeenCalled();
    });

    it('壊れたメッセージは 400 で弾き、上限の枠を使わない', async () => {
      const response = await handleGenerate(
        generateRequest({ mode: 'slides', messages: [{ role: 'user' }] }),
      );

      expect(response.status).toBe(400);
      expect(reserveGenerationUsage).not.toHaveBeenCalled();
    });
  });

  describe('エッジケース', () => {
    it('生成の途中で中断されても、予約した行の更新を after に載せる（トークン数は不明として null）', async () => {
      const { started } = mockClaude('hang');
      const update = Promise.resolve();
      vi.mocked(updateGenerationUsageTokens).mockReturnValue(update);
      const controller = new AbortController();

      const response = await handleGenerate(
        generateRequest(slidesBody, controller.signal),
      );
      await started;
      controller.abort();
      await response.text();

      expect(updateGenerationUsageTokens).toHaveBeenCalledExactlyOnceWith({
        id: 7,
        inputTokens: null,
        outputTokens: null,
      });
      expect(after).toHaveBeenCalledExactlyOnceWith(update);
    });

    it('エラーで終わった生成は、予約した行にトークン数を書かない（行は枠として残る）', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mockClaude('fail');

      const response = await handleGenerate(generateRequest(slidesBody));
      await expect(response.text()).rejects.toThrow('overloaded');

      expect(reserveGenerationUsage).toHaveBeenCalledOnce();
      expect(updateGenerationUsageTokens).not.toHaveBeenCalled();
      expect(after).not.toHaveBeenCalled();
    });
  });
});
