import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

import { markStopRequested } from '../infrastructure/thread-repository';
import { handleStopRequest } from './stop-run';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/require-allowed-session', () => ({
  requireAllowedSession: vi.fn(),
}));
vi.mock('../infrastructure/thread-repository', () => ({
  markStopRequested: vi.fn(),
}));

const THREAD_ID = '0b9c6f3e-5a4e-4f7a-9d0e-2f6b1c3a8e71';

const stopRequest = (): Request =>
  new Request(`https://ai.k8o.me/api/chat/${THREAD_ID}/stop`, {
    method: 'POST',
  });

beforeEach(() => {
  vi.useFakeTimers({
    toFake: ['Date'],
    now: Date.parse('2026-10-14T12:00:00.000Z'),
  });
  vi.mocked(requireAllowedSession).mockResolvedValue({ userId: 'u1' });
  vi.mocked(markStopRequested).mockResolvedValue();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('handleStopRequest', () => {
  describe('正常系', () => {
    it('自分のスレッドへの停止の要求を、今の時刻で書いて 204 を返す', async () => {
      const response = await handleStopRequest(stopRequest(), THREAD_ID);

      expect(response.status).toBe(204);
      expect(markStopRequested).toHaveBeenCalledExactlyOnceWith({
        threadId: THREAD_ID,
        userId: 'u1',
        requestedAt: '2026-10-14T12:00:00.000Z',
      });
    });
  });

  describe('異常系', () => {
    it('未許可の利用者には 401 を返し、書かない', async () => {
      vi.mocked(requireAllowedSession).mockResolvedValue(null);

      const response = await handleStopRequest(stopRequest(), THREAD_ID);

      expect(response.status).toBe(401);
      expect(markStopRequested).not.toHaveBeenCalled();
    });
  });
});
