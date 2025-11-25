import { resend } from './index';

vi.mock('resend');

describe('email service', () => {
  describe('resend', () => {
    it('Resendインスタンスを作成できる', () => {
      const originalEnv = process.env['RESEND_API_KEY'];
      process.env['RESEND_API_KEY'] = 'test-api-key';

      const instance = resend();

      expect(instance).toBeDefined();

      process.env['RESEND_API_KEY'] = originalEnv;
    });

    it('環境変数が設定されていない場合でもインスタンスを作成できる', () => {
      const originalEnv = process.env['RESEND_API_KEY'];
      process.env['RESEND_API_KEY'] = undefined;

      const instance = resend();

      expect(instance).toBeDefined();

      process.env['RESEND_API_KEY'] = originalEnv;
    });
  });
});
