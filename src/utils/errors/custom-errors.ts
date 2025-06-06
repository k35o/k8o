export enum ErrorCode {
  // 一般的なエラー
  UNKNOWN = 'UNKNOWN',
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',

  // 認証・認可
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // リソース
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // レート制限
  RATE_LIMITED = 'RATE_LIMITED',

  // データベース
  DATABASE_ERROR = 'DATABASE_ERROR',

  // ブログ関連
  BLOG_NOT_FOUND = 'BLOG_NOT_FOUND',

  // フィードバック関連
  FEEDBACK_VALIDATION = 'FEEDBACK_VALIDATION',

  // クイズ関連
  QUIZ_NOT_FOUND = 'QUIZ_NOT_FOUND',
  QUIZ_VALIDATION = 'QUIZ_VALIDATION',
}

export type ErrorMetadata = {
  code: ErrorCode;
  userMessage?: string;
  details?: Record<string, any>;
  statusCode?: number;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly userMessage: string;
  public readonly details: Record<string, any>;
  public readonly statusCode: number;
  public readonly timestamp: Date;

  constructor(message: string, metadata: ErrorMetadata) {
    super(message);
    this.name = 'AppError';
    this.code = metadata.code;
    this.userMessage =
      metadata.userMessage ?? 'システムエラーが発生しました';
    this.details = metadata.details ?? {};
    this.statusCode = metadata.statusCode ?? 500;
    this.timestamp = new Date();

    // エラースタックの最適化
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      userMessage: this.userMessage,
      details: this.details,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

// 特定のエラータイプ
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, {
      code: ErrorCode.VALIDATION,
      userMessage: '入力内容に問題があります',
      details,
      statusCode: 400,
    });
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;

    super(message, {
      code: ErrorCode.NOT_FOUND,
      userMessage: 'お探しのページまたはデータが見つかりません',
      details: { resource, identifier },
      statusCode: 404,
    });
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, {
      code: ErrorCode.UNAUTHORIZED,
      userMessage: 'ログインが必要です',
      statusCode: 401,
    });
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, {
      code: ErrorCode.FORBIDDEN,
      userMessage: 'この操作を実行する権限がありません',
      statusCode: 403,
    });
    this.name = 'ForbiddenError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super('Rate limit exceeded', {
      code: ErrorCode.RATE_LIMITED,
      userMessage:
        '送信回数が上限に達しました。しばらく時間をおいて再度お試しください',
      details: { retryAfter },
      statusCode: 429,
    });
    this.name = 'RateLimitError';
  }
}

export class BlogNotFoundError extends AppError {
  constructor(slug: string) {
    super(`Blog with slug '${slug}' not found`, {
      code: ErrorCode.BLOG_NOT_FOUND,
      userMessage: '記事が見つかりません',
      details: { slug },
      statusCode: 404,
    });
    this.name = 'BlogNotFoundError';
  }
}

export class FeedbackValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, {
      code: ErrorCode.FEEDBACK_VALIDATION,
      userMessage: 'フィードバックの内容に問題があります',
      details,
      statusCode: 400,
    });
    this.name = 'FeedbackValidationError';
  }
}

// エラーファクトリ関数
export const createAppError = (
  message: string,
  code: ErrorCode,
  statusCode = 500,
  userMessage?: string,
  details?: Record<string, any>,
): AppError => {
  return new AppError(message, {
    code,
    statusCode,
    userMessage,
    details,
  });
};

// エラータイプガード
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

export const isValidationError = (
  error: unknown,
): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isNotFoundError = (
  error: unknown,
): error is NotFoundError => {
  return error instanceof NotFoundError;
};

export const isRateLimitError = (
  error: unknown,
): error is RateLimitError => {
  return error instanceof RateLimitError;
};
