'use client';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Heading } from '@/components/heading';
import { AppError, isAppError } from '@/utils/errors/custom-errors';
import { Component, ErrorInfo, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

type State = {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // エラー情報をログ出力
    if (isAppError(error)) {
      console.error('AppError details:', {
        code: error.code,
        userMessage: error.userMessage,
        details: error.details,
        statusCode: error.statusCode,
        timestamp: error.timestamp,
      });
    }

    // 外部エラー監視サービスにエラーを送信する場合はここで実装
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error,
          this.handleRetry,
        );
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          retry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

type ErrorFallbackProps = {
  error: Error;
  retry: () => void;
}

function DefaultErrorFallback({ error, retry }: ErrorFallbackProps) {
  const isCustomError = isAppError(error);
  const userMessage = isCustomError
    ? error.userMessage
    : 'システムエラーが発生しました';
  const showDetails = process.env.NODE_ENV === 'development';

  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="space-y-4 text-center">
          <div className="text-6xl">⚠️</div>

          <Heading level={2} className="text-fg-danger">
            エラーが発生しました
          </Heading>

          <p className="text-fg-mute">{userMessage}</p>

          {showDetails && (
            <details className="mt-4 text-left">
              <summary className="text-fg-mute hover:text-fg-base cursor-pointer text-sm">
                エラーの詳細を表示
              </summary>
              <div className="bg-bg-mute mt-2 rounded border p-3 font-mono text-sm">
                <div className="mb-2">
                  <strong>Message:</strong> {error.message}
                </div>
                {isCustomError && (
                  <>
                    <div className="mb-2">
                      <strong>Code:</strong> {error.code}
                    </div>
                    <div className="mb-2">
                      <strong>Status:</strong> {error.statusCode}
                    </div>
                    {Object.keys(error.details).length > 0 && (
                      <div className="mb-2">
                        <strong>Details:</strong>
                        <pre className="mt-1 text-xs">
                          {JSON.stringify(error.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </>
                )}
                {error.stack && (
                  <div>
                    <strong>Stack:</strong>
                    <pre className="mt-1 max-h-32 overflow-auto text-xs">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          <div className="flex justify-center gap-2">
            <Button onClick={retry} variant="outlined">
              再試行
            </Button>
            <Button
              onClick={() => { window.location.reload(); }}
              variant="filled"
            >
              ページを再読み込み
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// 関数型コンポーネント版のエラー境界（React 18+対応）
export function ErrorBoundaryWrapper({
  children,
  fallback,
  onError,
}: Props) {
  return (
    <ErrorBoundary fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundary>
  );
}

// 特定のエラータイプ用のエラー境界
export function NotFoundErrorBoundary({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={(error, retry) => {
        if (isAppError(error) && error.code === 'NOT_FOUND') {
          return (
            <div className="flex min-h-[400px] items-center justify-center p-4">
              <Card className="w-full max-w-md space-y-4 text-center">
                <div className="text-6xl">🔍</div>
                <Heading level={2}>ページが見つかりません</Heading>
                <p className="text-fg-mute">{error.userMessage}</p>
                <Button onClick={() => { window.history.back(); }}>
                  前のページに戻る
                </Button>
              </Card>
            </div>
          );
        }
        return <DefaultErrorFallback error={error} retry={retry} />;
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
