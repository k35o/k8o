import {
  ErrorBoundary,
  NotFoundErrorBoundary,
} from './error-boundary';
import {
  AppError,
  ErrorCode,
  NotFoundError,
} from '@/utils/errors/custom-errors';
import { render, screen } from '@testing-library/react';

// エラーを投げるテスト用コンポーネント
function ThrowError({ error }: { error: Error }): never {
  throw error;
}

// コンソールエラーをモック
const originalError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  it('エラーが発生しない場合は子コンポーネントを表示する', () => {
    render(
      <ErrorBoundary>
        <div>正常なコンテンツ</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText('正常なコンテンツ')).toBeInTheDocument();
  });

  it('一般的なエラーをキャッチしてデフォルトのエラー画面を表示する', () => {
    const error = new Error('テストエラー');

    render(
      <ErrorBoundary>
        <ThrowError error={error} />
      </ErrorBoundary>,
    );

    expect(
      screen.getByText('エラーが発生しました'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('システムエラーが発生しました'),
    ).toBeInTheDocument();
    expect(screen.getByText('再試行')).toBeInTheDocument();
    expect(
      screen.getByText('ページを再読み込み'),
    ).toBeInTheDocument();
  });

  it('AppErrorをキャッチしてユーザー向けメッセージを表示する', () => {
    const error = new AppError('Internal error', {
      code: ErrorCode.VALIDATION,
      userMessage: 'カスタムユーザーメッセージ',
      statusCode: 400,
    });

    render(
      <ErrorBoundary>
        <ThrowError error={error} />
      </ErrorBoundary>,
    );

    expect(
      screen.getByText('エラーが発生しました'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('カスタムユーザーメッセージ'),
    ).toBeInTheDocument();
  });

  it('カスタムfallbackが提供された場合はそれを使用する', () => {
    const error = new Error('テストエラー');
    const customFallback = (_error: Error, retry: () => void) => (
      <div>
        <div>カスタムエラー画面</div>
        <button onClick={retry}>リトライ</button>
      </div>
    );

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError error={error} />
      </ErrorBoundary>,
    );

    expect(
      screen.getByText('カスタムエラー画面'),
    ).toBeInTheDocument();
    expect(screen.getByText('リトライ')).toBeInTheDocument();
  });

  it('onErrorコールバックが呼ばれる', () => {
    const error = new Error('テストエラー');
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError error={error} />
      </ErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledWith(error, expect.any(Object));
  });
});

describe('NotFoundErrorBoundary', () => {
  it('NotFoundErrorに対して専用のエラー画面を表示する', () => {
    const error = new NotFoundError('Blog', 'test-slug');

    render(
      <NotFoundErrorBoundary>
        <ThrowError error={error} />
      </NotFoundErrorBoundary>,
    );

    expect(
      screen.getByText('ページが見つかりません'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('お探しのページまたはデータが見つかりません'),
    ).toBeInTheDocument();
    expect(screen.getByText('前のページに戻る')).toBeInTheDocument();
  });

  it('NotFoundError以外はデフォルトのエラー画面を表示する', () => {
    const error = new AppError('Other error', {
      code: ErrorCode.VALIDATION,
      userMessage: 'バリデーションエラー',
    });

    render(
      <NotFoundErrorBoundary>
        <ThrowError error={error} />
      </NotFoundErrorBoundary>,
    );

    expect(
      screen.getByText('エラーが発生しました'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('バリデーションエラー'),
    ).toBeInTheDocument();
    expect(screen.getByText('再試行')).toBeInTheDocument();
  });
});
