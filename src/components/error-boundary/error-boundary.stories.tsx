import {
  ErrorBoundary,
  NotFoundErrorBoundary,
} from './error-boundary';
import { Button } from '@/components/button';
import {
  AppError,
  ErrorCode,
  NotFoundError,
  ValidationError,
} from '@/utils/errors/custom-errors';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';

// エラーを投げるコンポーネント
function ErrorThrower({ error }: { error: Error | null }) {
  if (error) {
    throw error;
  }
  return <div>正常なコンテンツが表示されます</div>;
}

// デモ用のコンポーネント
function ErrorDemo({
  errorType,
}: {
  errorType:
    | 'none'
    | 'general'
    | 'validation'
    | 'notfound'
    | 'ratelimit';
}) {
  const [shouldThrow, setShouldThrow] = useState(false);

  const getError = (): Error | null => {
    switch (errorType) {
      case 'general':
        return new Error('一般的なJavaScriptエラーです');
      case 'validation':
        throw new ValidationError('バリデーションエラーです', {
          field: 'email',
        });
      case 'notfound':
        throw new NotFoundError('Blog', 'test-slug');
      case 'ratelimit':
        throw new AppError('Rate limit exceeded', {
          code: ErrorCode.RATE_LIMITED,
          userMessage: 'レート制限に達しました',
          statusCode: 429,
        });
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Button
          onClick={() => {
            setShouldThrow(!shouldThrow);
          }}
          variant={shouldThrow ? 'outlined' : 'filled'}
        >
          {shouldThrow ? 'エラーを解除' : 'エラーを発生させる'}
        </Button>
      </div>
      <ErrorThrower error={shouldThrow ? getError() : null} />
    </div>
  );
}

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'アプリケーション内でエラーをキャッチして適切なUI を表示するコンポーネント',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

export const Default: Story = {
  render: () => (
    <ErrorBoundary>
      <ErrorDemo errorType="general" />
    </ErrorBoundary>
  ),
  parameters: {
    docs: {
      description: {
        story: '一般的なJavaScriptエラーをキャッチした場合の表示',
      },
    },
  },
};

export const ValidationError: Story = {
  render: () => (
    <ErrorBoundary>
      <ErrorDemo errorType="validation" />
    </ErrorBoundary>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'バリデーションエラーをキャッチした場合の表示（ユーザー向けメッセージ表示）',
      },
    },
  },
};

export const NotFoundError: Story = {
  render: () => (
    <NotFoundErrorBoundary>
      <ErrorDemo errorType="notfound" />
    </NotFoundErrorBoundary>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'NotFoundErrorBoundaryでNotFoundErrorをキャッチした場合の専用UI',
      },
    },
  },
};

export const RateLimitError: Story = {
  render: () => (
    <ErrorBoundary>
      <ErrorDemo errorType="ratelimit" />
    </ErrorBoundary>
  ),
  parameters: {
    docs: {
      description: {
        story: 'レート制限エラーをキャッチした場合の表示',
      },
    },
  },
};

export const CustomFallback: Story = {
  render: () => (
    <ErrorBoundary
      fallback={(error, retry) => (
        <div className="bg-bg-danger-mute border-border-danger rounded border p-6">
          <h2 className="text-fg-danger mb-2 text-lg font-bold">
            カスタムエラー画面
          </h2>
          <p className="text-fg-base mb-4">{error.message}</p>
          <Button onClick={retry} size="sm">
            もう一度試す
          </Button>
        </div>
      )}
    >
      <ErrorDemo errorType="general" />
    </ErrorBoundary>
  ),
  parameters: {
    docs: {
      description: {
        story: 'カスタムfallbackコンポーネントを使用した場合の表示',
      },
    },
  },
};

export const NormalContent: Story = {
  render: () => (
    <ErrorBoundary>
      <ErrorDemo errorType="none" />
    </ErrorBoundary>
  ),
  parameters: {
    docs: {
      description: {
        story: 'エラーが発生しない場合の通常表示',
      },
    },
  },
};
