import { db } from '@repo/database';
import { subscribe } from '../subscribe';
import { sendVerificationEmail } from '../verify';

vi.mock('@repo/database', () => ({
  db: {
    query: {
      subscribers: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn().mockReturnValue({
      values: vi.fn(),
    }),
    _schema: {
      subscribers: {},
    },
  },
}));
vi.mock('@/services/subscriptions/verify');

describe('subscribe', () => {
  describe('subscribe', () => {
    it('メールアドレスが不正な場合はエラーを返す', async () => {
      const result = await subscribe('invalid-email');
      expect(result).toEqual({
        success: false,
        message: 'メールアドレスが不正です',
      });
    });
    it('認証済みのメールアドレスであれば何もしない', async () => {
      const mockFirst = vi.fn().mockResolvedValue({
        id: 1,
        isVerified: true,
      });
      const mockInsert = vi.fn();
      vi.mocked(db.query.subscribers.findFirst).mockImplementation(mockFirst);
      vi.mocked(db.insert).mockImplementation(mockInsert);

      const result = await subscribe('test@k8o.me');

      expect(mockFirst).toHaveBeenCalledOnce();
      expect(mockInsert).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        data: null,
      });
    });
    it('認証済みでなければ再度招待メールを送る', async () => {
      const mockFirst = vi.fn().mockResolvedValue({
        id: 1,
        isVerified: false,
      });
      const mockInsert = vi.fn();
      const mockSendVerificationEmail = vi.fn();
      vi.mocked(db.query.subscribers.findFirst).mockImplementation(mockFirst);
      vi.mocked(db.insert).mockImplementation(mockInsert);
      vi.mocked(sendVerificationEmail).mockImplementation(
        mockSendVerificationEmail,
      );

      const result = await subscribe('test@k8o.me');

      expect(mockFirst).toHaveBeenCalledOnce();
      expect(mockInsert).not.toHaveBeenCalled();
      expect(mockSendVerificationEmail).toHaveBeenCalledOnce();
      expect(result).toEqual({
        success: true,
        data: null,
      });
    });
    it('新規登録の場合は招待メールを送る', async () => {
      const mockFirst = vi.fn().mockResolvedValue(null);
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn(),
      });
      const mockSendVerificationEmail = vi.fn();
      vi.mocked(db.query.subscribers.findFirst).mockImplementation(mockFirst);
      vi.mocked(db.insert).mockImplementation(mockInsert);
      vi.mocked(sendVerificationEmail).mockImplementation(
        mockSendVerificationEmail,
      );

      const result = await subscribe('test@k8o.me');

      expect(mockFirst).toHaveBeenCalledOnce();
      expect(mockInsert).toHaveBeenCalledOnce();
      expect(mockSendVerificationEmail).toHaveBeenCalledOnce();
      expect(result).toEqual({
        success: true,
        data: null,
      });
    });
  });
});
