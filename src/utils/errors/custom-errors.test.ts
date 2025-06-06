import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  RateLimitError,
  BlogNotFoundError,
  FeedbackValidationError,
  ErrorCode,
  createAppError,
  isAppError,
  isValidationError,
  isNotFoundError,
  isRateLimitError,
} from './custom-errors';

describe('Custom Errors', () => {
  describe('AppError', () => {
    it('基本的なエラー情報を正しく設定する', () => {
      const error = new AppError('Test error', {
        code: ErrorCode.UNKNOWN,
        userMessage: 'ユーザー向けメッセージ',
        details: { key: 'value' },
        statusCode: 500,
      });

      expect(error.name).toBe('AppError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ErrorCode.UNKNOWN);
      expect(error.userMessage).toBe('ユーザー向けメッセージ');
      expect(error.details).toEqual({ key: 'value' });
      expect(error.statusCode).toBe(500);
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('デフォルト値を正しく設定する', () => {
      const error = new AppError('Test error', {
        code: ErrorCode.UNKNOWN,
      });

      expect(error.userMessage).toBe('システムエラーが発生しました');
      expect(error.details).toEqual({});
      expect(error.statusCode).toBe(500);
    });

    it('toJSON()メソッドが正しく動作する', () => {
      const error = new AppError('Test error', {
        code: ErrorCode.UNKNOWN,
        userMessage: 'ユーザー向けメッセージ',
      });

      const json = error.toJSON();

      expect(json).toEqual({
        name: 'AppError',
        message: 'Test error',
        code: ErrorCode.UNKNOWN,
        userMessage: 'ユーザー向けメッセージ',
        details: {},
        statusCode: 500,
        timestamp: error.timestamp,
        stack: error.stack,
      });
    });
  });

  describe('ValidationError', () => {
    it('バリデーションエラーの情報を正しく設定する', () => {
      const error = new ValidationError('Validation failed', {
        field: 'email',
      });

      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe(ErrorCode.VALIDATION);
      expect(error.userMessage).toBe('入力内容に問題があります');
      expect(error.details).toEqual({ field: 'email' });
      expect(error.statusCode).toBe(400);
    });
  });

  describe('NotFoundError', () => {
    it('リソースが見つからないエラーを正しく設定する', () => {
      const error = new NotFoundError('Blog', 'test-slug');

      expect(error.name).toBe('NotFoundError');
      expect(error.message).toBe(
        "Blog with identifier 'test-slug' not found",
      );
      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.userMessage).toBe(
        'お探しのページまたはデータが見つかりません',
      );
      expect(error.details).toEqual({
        resource: 'Blog',
        identifier: 'test-slug',
      });
      expect(error.statusCode).toBe(404);
    });

    it('識別子なしのNotFoundErrorを正しく設定する', () => {
      const error = new NotFoundError('User');

      expect(error.message).toBe('User not found');
      expect(error.details).toEqual({
        resource: 'User',
        identifier: undefined,
      });
    });
  });

  describe('UnauthorizedError', () => {
    it('認証エラーの情報を正しく設定する', () => {
      const error = new UnauthorizedError();

      expect(error.name).toBe('UnauthorizedError');
      expect(error.message).toBe('Unauthorized access');
      expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(error.userMessage).toBe('ログインが必要です');
      expect(error.statusCode).toBe(401);
    });

    it('カスタムメッセージを設定できる', () => {
      const error = new UnauthorizedError(
        'Custom unauthorized message',
      );

      expect(error.message).toBe('Custom unauthorized message');
    });
  });

  describe('ForbiddenError', () => {
    it('認可エラーの情報を正しく設定する', () => {
      const error = new ForbiddenError();

      expect(error.name).toBe('ForbiddenError');
      expect(error.message).toBe('Access forbidden');
      expect(error.code).toBe(ErrorCode.FORBIDDEN);
      expect(error.userMessage).toBe(
        'この操作を実行する権限がありません',
      );
      expect(error.statusCode).toBe(403);
    });
  });

  describe('RateLimitError', () => {
    it('レート制限エラーの情報を正しく設定する', () => {
      const error = new RateLimitError(60);

      expect(error.name).toBe('RateLimitError');
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.code).toBe(ErrorCode.RATE_LIMITED);
      expect(error.userMessage).toBe(
        '送信回数が上限に達しました。しばらく時間をおいて再度お試しください',
      );
      expect(error.details).toEqual({ retryAfter: 60 });
      expect(error.statusCode).toBe(429);
    });
  });

  describe('BlogNotFoundError', () => {
    it('ブログが見つからないエラーの情報を正しく設定する', () => {
      const error = new BlogNotFoundError('test-slug');

      expect(error.name).toBe('BlogNotFoundError');
      expect(error.message).toBe(
        "Blog with slug 'test-slug' not found",
      );
      expect(error.code).toBe(ErrorCode.BLOG_NOT_FOUND);
      expect(error.userMessage).toBe('記事が見つかりません');
      expect(error.details).toEqual({ slug: 'test-slug' });
      expect(error.statusCode).toBe(404);
    });
  });

  describe('FeedbackValidationError', () => {
    it('フィードバックバリデーションエラーの情報を正しく設定する', () => {
      const error = new FeedbackValidationError('Invalid feedback', {
        type: 'comment',
      });

      expect(error.name).toBe('FeedbackValidationError');
      expect(error.message).toBe('Invalid feedback');
      expect(error.code).toBe(ErrorCode.FEEDBACK_VALIDATION);
      expect(error.userMessage).toBe(
        'フィードバックの内容に問題があります',
      );
      expect(error.details).toEqual({ type: 'comment' });
      expect(error.statusCode).toBe(400);
    });
  });

  describe('createAppError', () => {
    it('ファクトリ関数でAppErrorを作成できる', () => {
      const error = createAppError(
        'Factory error',
        ErrorCode.DATABASE_ERROR,
        500,
        'データベースエラー',
        { table: 'blogs' },
      );

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Factory error');
      expect(error.code).toBe(ErrorCode.DATABASE_ERROR);
      expect(error.statusCode).toBe(500);
      expect(error.userMessage).toBe('データベースエラー');
      expect(error.details).toEqual({ table: 'blogs' });
    });
  });

  describe('Type Guards', () => {
    it('isAppError が正しく動作する', () => {
      const appError = new AppError('test', {
        code: ErrorCode.UNKNOWN,
      });
      const standardError = new Error('test');

      expect(isAppError(appError)).toBe(true);
      expect(isAppError(standardError)).toBe(false);
      expect(isAppError(null)).toBe(false);
      expect(isAppError(undefined)).toBe(false);
    });

    it('isValidationError が正しく動作する', () => {
      const validationError = new ValidationError('test');
      const appError = new AppError('test', {
        code: ErrorCode.UNKNOWN,
      });

      expect(isValidationError(validationError)).toBe(true);
      expect(isValidationError(appError)).toBe(false);
    });

    it('isNotFoundError が正しく動作する', () => {
      const notFoundError = new NotFoundError('Test');
      const appError = new AppError('test', {
        code: ErrorCode.UNKNOWN,
      });

      expect(isNotFoundError(notFoundError)).toBe(true);
      expect(isNotFoundError(appError)).toBe(false);
    });

    it('isRateLimitError が正しく動作する', () => {
      const rateLimitError = new RateLimitError();
      const appError = new AppError('test', {
        code: ErrorCode.UNKNOWN,
      });

      expect(isRateLimitError(rateLimitError)).toBe(true);
      expect(isRateLimitError(appError)).toBe(false);
    });
  });
});
