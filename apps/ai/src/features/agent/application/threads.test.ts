import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  selectThread,
  selectThreadMessages,
  selectThreadsByUser,
} from '../infrastructure/thread-repository';
import type { ThreadRow } from '../infrastructure/thread-repository';
import { listThreads, loadThread } from './threads';

vi.mock('server-only', () => ({}));
vi.mock('../infrastructure/thread-repository', () => ({
  selectThread: vi.fn(),
  selectThreadMessages: vi.fn(),
  selectThreadsByUser: vi.fn(),
}));

const now = Date.parse('2026-10-14T12:00:00.000Z');

const thread = (overrides: Partial<ThreadRow> = {}): ThreadRow => ({
  id: 't1',
  userId: 'u1',
  title: '記事の要約',
  model: 'claude-opus-5-5',
  runId: null,
  runHeartbeatAt: null,
  lastInputTokens: null,
  updatedAt: '2026-10-14T11:00:00.000Z',
  ...overrides,
});

const messages = [
  { id: 'm1', role: 'user', parts: [{ type: 'text', text: '要約して' }] },
];

beforeEach(() => {
  vi.mocked(selectThread).mockResolvedValue(thread());
  vi.mocked(selectThreadMessages).mockResolvedValue(messages);
  vi.mocked(selectThreadsByUser).mockResolvedValue([]);
});

describe('listThreads', () => {
  describe('正常系', () => {
    it('利用者のスレッドを、読んだ時点で生成中かどうかと一緒に返す', async () => {
      vi.mocked(selectThreadsByUser).mockResolvedValue([
        thread({
          id: 't2',
          runId: 'run-1',
          runHeartbeatAt: '2026-10-14T11:59:58.000Z',
        }),
        thread({ id: 't1' }),
      ]);

      await expect(listThreads({ userId: 'u1', now })).resolves.toStrictEqual([
        {
          id: 't2',
          title: '記事の要約',
          updatedAt: '2026-10-14T11:00:00.000Z',
          running: true,
        },
        {
          id: 't1',
          title: '記事の要約',
          updatedAt: '2026-10-14T11:00:00.000Z',
          running: false,
        },
      ]);
      expect(selectThreadsByUser).toHaveBeenCalledExactlyOnceWith('u1');
    });
  });
});

describe('loadThread', () => {
  describe('正常系', () => {
    it('自分のスレッドを、モデルとメッセージと一緒に返す', async () => {
      await expect(
        loadThread({ threadId: 't1', userId: 'u1', now }),
      ).resolves.toStrictEqual({
        id: 't1',
        title: '記事の要約',
        model: 'claude-opus-5-5',
        running: false,
        messages,
      });
    });
  });

  describe('異常系', () => {
    it('スレッドが無ければ null を返す', async () => {
      vi.mocked(selectThread).mockResolvedValue(null);

      await expect(
        loadThread({ threadId: 't1', userId: 'u1', now }),
      ).resolves.toBeNull();
    });

    it('ほかの利用者のスレッドは null を返し、メッセージを読まない', async () => {
      vi.mocked(selectThread).mockResolvedValue(thread({ userId: 'u2' }));

      await expect(
        loadThread({ threadId: 't1', userId: 'u1', now }),
      ).resolves.toBeNull();
      expect(selectThreadMessages).not.toHaveBeenCalled();
    });

    it('モデルが知らないものなら null を返す', async () => {
      vi.mocked(selectThread).mockResolvedValue(
        thread({ model: 'claude-haiku-4-5' }),
      );

      await expect(
        loadThread({ threadId: 't1', userId: 'u1', now }),
      ).resolves.toBeNull();
    });
  });

  describe('エッジケース', () => {
    it('生成中のスレッドも、その時点までのメッセージと一緒に返す', async () => {
      vi.mocked(selectThread).mockResolvedValue(
        thread({ runId: 'run-1', runHeartbeatAt: '2026-10-14T11:59:58.000Z' }),
      );

      await expect(
        loadThread({ threadId: 't1', userId: 'u1', now }),
      ).resolves.toMatchObject({ running: true, messages });
    });
  });
});
