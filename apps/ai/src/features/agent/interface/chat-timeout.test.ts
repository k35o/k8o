import { MockLanguageModelV4 } from 'ai/test';
import { after } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  insertUsageWithinLimits,
  selectCostSinceMicroUsd,
  updateUsageCost,
} from '@/features/usage/infrastructure/usage-repository';
import { requireAllowedSession } from '@/shared/auth/require-allowed-session';
import { getGenerationModel } from '@/shared/claude/claude-provider';

import type { AgentUIMessage } from '../application/agent-message';
import type * as agentRun from '../application/agent-run';
import {
  insertThreadMessage,
  insertThreadWithRun,
  releaseThreadRun,
  selectThread,
  selectThreadMessages,
  updateLastInputTokens,
} from '../infrastructure/thread-repository';
import { handleChat } from './chat';

// 実行の時間の上限を縮めるとほかのテストが時間切れで落ちうるので、このファイルに分ける
vi.mock('../application/agent-run', async (importOriginal) => ({
  ...(await importOriginal<typeof agentRun>()),
  RUN_TIMEOUT_MS: 50,
}));
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
vi.mock('../infrastructure/thread-repository', () => ({
  claimThreadRun: vi.fn(),
  insertThreadMessage: vi.fn(),
  insertThreadWithRun: vi.fn(),
  releaseThreadRun: vi.fn(),
  selectThread: vi.fn(),
  selectThreadMessages: vi.fn(),
  updateLastInputTokens: vi.fn(),
}));
vi.mock('../application/stop-watch', () => ({ watchStopRequest: vi.fn() }));

type LanguageModelV4StreamPart =
  Awaited<
    ReturnType<MockLanguageModelV4['doStream']>
  >['stream'] extends ReadableStream<infer PART>
    ? PART
    : never;

// 書き始めたところで止まって中断を待ち、中断されると実際の fetch と同じく、読み途中の
// ストリームを中断の理由でエラーにする Claude の代役
const mockHangingClaude = (): void => {
  vi.mocked(getGenerationModel).mockReturnValue(
    new MockLanguageModelV4({
      doStream: ({ abortSignal }) =>
        Promise.resolve({
          stream: new ReadableStream<LanguageModelV4StreamPart>({
            start(controller) {
              controller.enqueue({ type: 'stream-start', warnings: [] });
              controller.enqueue({ type: 'text-start', id: 't' });
              controller.enqueue({
                type: 'text-delta',
                id: 't',
                delta: '途中まで',
              });
              abortSignal?.addEventListener('abort', () => {
                controller.error(abortSignal.reason);
              });
            },
          }),
        }),
    }),
  );
};

let afterTasks: Array<Promise<unknown>> = [];

beforeEach(() => {
  afterTasks = [];
  vi.mocked(after).mockImplementation((task) => {
    if (task instanceof Promise) {
      afterTasks.push(task);
    }
  });
  vi.mocked(requireAllowedSession).mockResolvedValue({ userId: 'u1' });
  vi.mocked(insertUsageWithinLimits).mockResolvedValue(7);
  vi.mocked(selectCostSinceMicroUsd).mockResolvedValue(0);
  vi.mocked(updateUsageCost).mockResolvedValue();
  vi.mocked(selectThread).mockResolvedValue(null);
  vi.mocked(insertThreadWithRun).mockResolvedValue(true);
  vi.mocked(selectThreadMessages).mockResolvedValue([]);
  vi.mocked(insertThreadMessage).mockResolvedValue();
  vi.mocked(releaseThreadRun).mockResolvedValue();
  vi.mocked(updateLastInputTokens).mockResolvedValue();
});

describe('handleChat', () => {
  describe('エッジケース', () => {
    it('停止の要求が無いまま時間の上限に達すると、途中までの返答を timeout として保存し、実行中の印を外す', async () => {
      mockHangingClaude();

      const response = await handleChat(
        new Request('https://ai.k8o.me/api/chat', {
          method: 'POST',
          body: JSON.stringify({
            threadId: '0b9c6f3e-5a4e-4f7a-9d0e-2f6b1c3a8e71',
            trigger: 'submit-message',
            message: {
              id: 'u1',
              role: 'user',
              parts: [{ type: 'text', text: 'arianotify の記事を要約して' }],
            },
          }),
        }),
      );
      await response.text();
      await Promise.all(afterTasks);

      const assistant = vi
        .mocked(insertThreadMessage)
        .mock.calls.map(([input]) => input.message)
        .at(-1) as AgentUIMessage | undefined;
      expect(assistant?.parts).toMatchObject([
        { type: 'step-start' },
        { type: 'text', text: '途中まで' },
      ]);
      expect(assistant?.metadata).toStrictEqual({ end: 'timeout' });
      expect(releaseThreadRun).toHaveBeenCalledOnce();
    });
  });
});
