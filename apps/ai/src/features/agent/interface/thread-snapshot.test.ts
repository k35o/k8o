import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

import {
  selectThread,
  selectThreadMessages,
} from '../infrastructure/thread-repository';
import type { ThreadRow } from '../infrastructure/thread-repository';
import { handleThreadSnapshot } from './thread-snapshot';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/require-allowed-session', () => ({
  requireAllowedSession: vi.fn(),
}));
vi.mock('../infrastructure/thread-repository', () => ({
  selectThread: vi.fn(),
  selectThreadMessages: vi.fn(),
}));

const THREAD_ID = '0b9c6f3e-5a4e-4f7a-9d0e-2f6b1c3a8e71';

const thread = (overrides: Partial<ThreadRow> = {}): ThreadRow => ({
  id: THREAD_ID,
  userId: 'u1',
  title: '記事の要約',
  model: 'claude-sonnet-5-5',
  runId: null,
  runHeartbeatAt: null,
  lastInputTokens: null,
  updatedAt: '2026-10-14T11:00:00.000Z',
  ...overrides,
});

const messages = [
  { id: 'u1', role: 'user', parts: [{ type: 'text', text: '要約して' }] },
  {
    id: 'a1',
    role: 'assistant',
    parts: [{ type: 'text', text: '要約です' }],
    metadata: { end: 'completed' },
  },
];

const snapshotRequest = (): Request =>
  new Request(`https://ai.k8o.me/api/chat/${THREAD_ID}`);

beforeEach(() => {
  vi.useFakeTimers({
    toFake: ['Date'],
    now: Date.parse('2026-10-14T12:00:00.000Z'),
  });
  vi.mocked(requireAllowedSession).mockResolvedValue({ userId: 'u1' });
  vi.mocked(selectThread).mockResolvedValue(thread());
  vi.mocked(selectThreadMessages).mockResolvedValue(messages);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('handleThreadSnapshot', () => {
  describe('正常系', () => {
    it('生成が終わっていれば、保存したメッセージを返す', async () => {
      const response = await handleThreadSnapshot(snapshotRequest(), THREAD_ID);

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toStrictEqual({
        running: false,
        messages,
      });
    });

    it('生成中なら、メッセージを読まずに生成中であることだけを返す', async () => {
      vi.mocked(selectThread).mockResolvedValue(
        thread({ runId: 'run-1', runHeartbeatAt: '2026-10-14T11:59:58.000Z' }),
      );

      const response = await handleThreadSnapshot(snapshotRequest(), THREAD_ID);

      await expect(response.json()).resolves.toStrictEqual({ running: true });
      expect(selectThreadMessages).not.toHaveBeenCalled();
    });
  });

  describe('異常系', () => {
    it('未許可の利用者には 401 を返す', async () => {
      vi.mocked(requireAllowedSession).mockResolvedValue(null);

      const response = await handleThreadSnapshot(snapshotRequest(), THREAD_ID);

      expect(response.status).toBe(401);
      expect(selectThread).not.toHaveBeenCalled();
    });

    it('スレッドが無ければ 404 を返す', async () => {
      vi.mocked(selectThread).mockResolvedValue(null);

      const response = await handleThreadSnapshot(snapshotRequest(), THREAD_ID);

      expect(response.status).toBe(404);
    });

    it('ほかの利用者のスレッドには 404 を返し、メッセージを読まない', async () => {
      vi.mocked(selectThread).mockResolvedValue(thread({ userId: 'u2' }));

      const response = await handleThreadSnapshot(snapshotRequest(), THREAD_ID);

      expect(response.status).toBe(404);
      expect(selectThreadMessages).not.toHaveBeenCalled();
    });
  });

  describe('エッジケース', () => {
    it('生存の印が 30 秒より前に止まった実行は、落ちたとみなしてメッセージを返す', async () => {
      vi.mocked(selectThread).mockResolvedValue(
        thread({ runId: 'run-1', runHeartbeatAt: '2026-10-14T11:59:29.999Z' }),
      );

      const response = await handleThreadSnapshot(snapshotRequest(), THREAD_ID);

      await expect(response.json()).resolves.toStrictEqual({
        running: false,
        messages,
      });
    });
  });
});
