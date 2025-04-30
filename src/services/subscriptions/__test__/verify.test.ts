import { sendVerificationEmail, verifyEmail } from '../verify';
import { db } from '#database/db';
import { resend } from '@/services/email';

vi.mock('#database/db');
vi.mock('@/services/email');
vi.mock('@/emails/verify-email');

describe('verify.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendVerificationEmail', () => {
    it('emailの形をしていないメールアドレスの場合は何もしない', async () => {
      const mockFirst = vi.fn();
      const mockUpdate = vi.fn();
      vi.mocked(db.query.subscribers.findFirst).mockImplementation(
        mockFirst,
      );
      vi.mocked(db.update).mockImplementation(mockUpdate);

      await sendVerificationEmail('invalid-email');

      expect(mockFirst).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });
    it('対象のsubscriberが存在しない場合は何もしない', async () => {
      const mockFirst = vi.fn().mockResolvedValue(null);
      const mockUpdate = vi.fn();
      vi.mocked(db.query.subscribers.findFirst).mockImplementation(
        mockFirst,
      );
      vi.mocked(db.update).mockImplementation(mockUpdate);

      await sendVerificationEmail('test@k8o.me');

      expect(mockFirst).toHaveBeenCalledOnce();
      expect(mockUpdate).not.toHaveBeenCalled();
    });
    it('isVerifiedがtrueの場合は何もしない', async () => {
      const mockFirst = vi.fn().mockResolvedValue({
        id: 1,
        isVerified: true,
        verificationToken: null,
        tokenExpiresAt: null,
      });
      const mockUpdate = vi.fn();
      vi.mocked(db.query.subscribers.findFirst).mockImplementation(
        mockFirst,
      );
      vi.mocked(db.update).mockImplementation(mockUpdate);

      await sendVerificationEmail('test@k8o.me');

      expect(mockFirst).toHaveBeenCalledOnce();
      expect(mockUpdate).not.toHaveBeenCalled();
    });
    it('verificationTokenがnullの場合は何もしない', async () => {
      const mockFirst = vi.fn().mockResolvedValue({
        id: 1,
        isVerified: false,
        verificationToken: null,
        tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60),
      });
      const mockUpdate = vi.fn();
      vi.mocked(db.query.subscribers.findFirst).mockImplementation(
        mockFirst,
      );
      vi.mocked(db.update).mockImplementation(mockUpdate);

      await sendVerificationEmail('test@k8o.me');

      expect(mockFirst).toHaveBeenCalledOnce();
      expect(mockUpdate).not.toHaveBeenCalled();
    });
    it('tokenExpiresAtがnullの場合は何もしない', async () => {
      const mockFirst = vi.fn().mockResolvedValue({
        id: 1,
        isVerified: false,
        verificationToken: 'valid-token',
        tokenExpiresAt: null,
      });
      const mockUpdate = vi.fn();
      vi.mocked(db.query.subscribers.findFirst).mockImplementation(
        mockFirst,
      );
      vi.mocked(db.update).mockImplementation(mockUpdate);

      await sendVerificationEmail('test@k8o.me');

      expect(mockFirst).toHaveBeenCalledOnce();
      expect(mockUpdate).not.toHaveBeenCalled();
    });
    it('verificationTokenが期限切れの場合は何もしない', async () => {
      const mockFirst = vi.fn().mockResolvedValue({
        id: 1,
        isVerified: false,
        verificationToken: 'old-token',
        tokenExpiresAt: new Date(Date.now() - 1000 * 60 * 60),
      });
      const mockUpdate = vi.fn();
      vi.mocked(db.query.subscribers.findFirst).mockImplementation(
        mockFirst,
      );
      vi.mocked(db.update).mockImplementation(mockUpdate);

      await sendVerificationEmail('test@k8o.me');

      expect(mockFirst).toHaveBeenCalledOnce();
      expect(mockUpdate).not.toHaveBeenCalled();
    });
    it('verificationTokenが期限内の場合はメールを送信する', async () => {
      const mockSend = vi.fn().mockReturnValue({
        error: null,
      });
      vi.mocked(resend.emails.send).mockImplementation(mockSend);

      const mockFirst = vi.fn().mockResolvedValue({
        id: 1,
        isVerified: false,
        verificationToken: 'valid-token',
        tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60),
      });
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn(),
        }),
      });
      vi.mocked(db.query.subscribers.findFirst).mockImplementation(
        mockFirst,
      );
      vi.mocked(db.update).mockImplementation(mockUpdate);

      await sendVerificationEmail('test@k8o.me');

      expect(mockFirst).toHaveBeenCalledOnce();
      expect(mockUpdate).toHaveBeenCalledOnce();
      expect(mockSend).toHaveBeenCalledOnce();
    });
  });

  describe('verifyEmail', () => {
    it('emailの形をしていないメールアドレスの場合は何もしない', async () => {
      const mockFirst = vi.fn();
      const mockUpdate = vi.fn();
      vi.mocked(db.query.subscribers.findFirst).mockImplementation(
        mockFirst,
      );
      vi.mocked(db.update).mockImplementation(mockUpdate);

      const result = await verifyEmail('invalid-email', '');

      expect(mockFirst).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        message: 'メールアドレスが不正です',
      });
    });
    it('対象のsubscriberが存在しない場合は何もしない', async () => {
      const mockFirst = vi.fn().mockResolvedValue(null);
      const mockUpdate = vi.fn();
      vi.mocked(db.query.subscribers.findFirst).mockImplementation(
        mockFirst,
      );
      vi.mocked(db.update).mockImplementation(mockUpdate);

      const result = await verifyEmail('test@k8o.me', '');

      expect(mockFirst).toHaveBeenCalledOnce();
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        message: '登録されていないメールアドレスです',
      });
    });
    it('verificationTokenがない場合は何もしない', async () => {
      const mockFirst = vi.fn().mockResolvedValue({
        id: 1,
        isVerified: false,
        verificationToken: null,
        tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60),
      });
      const mockUpdate = vi.fn();
      vi.mocked(db.query.subscribers.findFirst).mockImplementation(
        mockFirst,
      );
      vi.mocked(db.update).mockImplementation(mockUpdate);

      const result = await verifyEmail('test@k8o.me', 'valid-token');

      expect(mockFirst).toHaveBeenCalledOnce();
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        message: 'トークンが不正です',
      });
    });
    it('tokenExpiresAtがない場合は何もしない', async () => {
      const mockFirst = vi.fn().mockResolvedValue({
        id: 1,
        isVerified: false,
        verificationToken: 'valid-token',
        tokenExpiresAt: null,
      });
      const mockUpdate = vi.fn();
      vi.mocked(db.query.subscribers.findFirst).mockImplementation(
        mockFirst,
      );
      vi.mocked(db.update).mockImplementation(mockUpdate);

      const result = await verifyEmail('test@k8o.me', 'valid-token');

      expect(mockFirst).toHaveBeenCalledOnce();
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        message: 'トークンが不正です',
      });
    });
    it('トークンが古い場合は何もしない', async () => {
      const mockFirst = vi.fn().mockResolvedValue({
        id: 1,
        isVerified: false,
        verificationToken: 'old-token',
        tokenExpiresAt: new Date(Date.now() - 1000 * 60 * 60),
      });
      const mockUpdate = vi.fn();
      vi.mocked(db.query.subscribers.findFirst).mockImplementation(
        mockFirst,
      );
      vi.mocked(db.update).mockImplementation(mockUpdate);

      const result = await verifyEmail('test@k8o.me', 'old-token');
      expect(mockFirst).toHaveBeenCalledOnce();
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        message: 'トークンが不正です',
      });
    });
    it('トークンが誤っている場合は何もしない', async () => {
      const mockFirst = vi.fn().mockResolvedValue({
        id: 1,
        isVerified: false,
        verificationToken: 'valid-token',
        tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60),
      });
      const mockUpdate = vi.fn();
      vi.mocked(db.query.subscribers.findFirst).mockImplementation(
        mockFirst,
      );
      vi.mocked(db.update).mockImplementation(mockUpdate);

      const result = await verifyEmail(
        'test@k8o.me',
        'invalid-token',
      );
      expect(mockFirst).toHaveBeenCalledOnce();
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        message: 'トークンが不正です',
      });
    });
    it('トークンが正しい場合はメールアドレスを確認する', async () => {
      const mockFirst = vi.fn().mockResolvedValue({
        id: 1,
        isVerified: false,
        verificationToken: 'valid-token',
        tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60),
      });
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn(),
        }),
      });
      vi.mocked(db.query.subscribers.findFirst).mockImplementation(
        mockFirst,
      );
      vi.mocked(db.update).mockImplementation(mockUpdate);

      const result = await verifyEmail('test@k8o.me', 'valid-token');

      expect(mockFirst).toHaveBeenCalledOnce();
      expect(mockUpdate).toHaveBeenCalledOnce();
      expect(result).toEqual({
        success: true,
        data: null,
      });
    });
  });
});
