import { NavigationGeneration } from '@k8ordo/router';
import { HttpResponse, http } from 'msw/http';
import { useState } from 'react';
import type { ComponentProps, FC, ReactNode } from 'react';
import { expect, fn, waitFor } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { RootErrorBoundary } from './root-error-boundary';

const REPORTS_URL = 'https://api.k8o.me/public/reports';

const receivedReports = fn<(reports: unknown) => void>();

let failing = true;

const Shell: FC = () => {
  if (failing) {
    throw new Error('ヘッダーの描画に失敗しました');
  }
  return <p>ヘッダー</p>;
};

// k8ordo の router が新しいページの木を当てるたびに替える値を、ボタンで替える
const Navigation: FC<{ children: ReactNode }> = ({ children }) => {
  const [generation, setGeneration] = useState(0);

  return (
    <NavigationGeneration value={generation}>
      <button
        onClick={() => {
          setGeneration((current) => current + 1);
        }}
        type="button"
      >
        別のページへ移る
      </button>
      {children}
    </NavigationGeneration>
  );
};

const meta = preview.meta({
  title: 'app/globals/root-error-boundary',
  component: RootErrorBoundary,
  // children は render で描くので、args の型を満たすためだけに置く
  args: { children: null } satisfies Partial<
    ComponentProps<typeof RootErrorBoundary>
  >,
  render: () => (
    <RootErrorBoundary>
      <Shell />
    </RootErrorBoundary>
  ),
  beforeEach: ({ msw }) => {
    failing = true;
    receivedReports.mockClear();
    msw.use(
      http.post(REPORTS_URL, async ({ request }) => {
        receivedReports(await request.json());
        return new HttpResponse(null, { status: 204 });
      }),
    );
  },
});

export const ShellFails = meta.story({
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole('heading', {
        level: 1,
        name: '問題が発生しました',
      }),
    ).toBeInTheDocument();
    await expect(canvas.queryByText('ヘッダー')).not.toBeInTheDocument();
    await expect(document.title).toBe('問題が発生しました | k8o');
    await waitFor(async () => {
      await expect(receivedReports).toHaveBeenCalledOnce();
    });
    await expect(receivedReports.mock.calls[0]?.[0]).toMatchObject([
      {
        type: 'client-error',
        body: { message: 'ヘッダーの描画に失敗しました' },
      },
    ]);
  },
});

export const RetryAfterRecovery = meta.story({
  play: async ({ canvas, userEvent }) => {
    await canvas.findByRole('heading', {
      level: 1,
      name: '問題が発生しました',
    });

    failing = false;
    await userEvent.click(canvas.getByRole('button', { name: '再試行' }));

    await expect(await canvas.findByText('ヘッダー')).toBeInTheDocument();
  },
});

export const RecoverOnNavigation = meta.story({
  render: () => (
    <Navigation>
      <RootErrorBoundary>
        <Shell />
      </RootErrorBoundary>
    </Navigation>
  ),
  play: async ({ canvas, userEvent }) => {
    await canvas.findByRole('heading', {
      level: 1,
      name: '問題が発生しました',
    });

    failing = false;
    await userEvent.click(
      canvas.getByRole('button', { name: '別のページへ移る' }),
    );

    await expect(await canvas.findByText('ヘッダー')).toBeInTheDocument();
  },
});
