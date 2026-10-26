import { HttpResponse, http } from 'msw/http';
import { expect, fn, waitFor } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { ErrorFallback } from './error-fallback';

const REPORTS_URL = 'https://api.k8o.me/public/reports';

const receivedReports = fn<(reports: unknown) => void>();

const meta = preview.meta({
  title: 'app/globals/error-fallback',
  component: ErrorFallback,
  args: {
    error: new Error('ページの描画に失敗しました'),
    reset: fn(),
  },
  beforeEach: ({ msw }) => {
    receivedReports.mockClear();
    msw.use(
      http.post(REPORTS_URL, async ({ request }) => {
        receivedReports(await request.json());
        return new HttpResponse(null, { status: 204 });
      }),
    );
  },
});

export const Primary = meta.story({
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 2, name: '問題が発生しました' }),
    ).toBeInTheDocument();
    await expect(document.title).toBe('問題が発生しました | k8o');
    await expect(
      canvas.getByRole('link', { name: 'トップへ戻る' }),
    ).toHaveAttribute('href', '/');
    await waitFor(async () => {
      await expect(receivedReports).toHaveBeenCalledOnce();
    });
    await expect(receivedReports.mock.calls[0]?.[0]).toMatchObject([
      {
        type: 'client-error',
        body: { message: 'ページの描画に失敗しました' },
      },
    ]);
  },
});

export const Retry = meta.story({
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '再試行' }));

    await expect(args.reset).toHaveBeenCalledOnce();
  },
});
