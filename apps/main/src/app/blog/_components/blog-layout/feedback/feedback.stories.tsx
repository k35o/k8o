import { HttpResponse, http } from 'msw';
import { expect, fn, screen } from 'storybook/test';

import preview from '../../../../../../.storybook/preview';
import { Feedback } from './feedback';

const FEEDBACK_URL = 'https://api.k8o.me/public/blogs/:slug/feedback';
const FAILED_MESSAGE =
  'フィードバックの送信に失敗しました。しばらくしてから再度お試しください。';

const receivedFeedback = fn();

const meta = preview.meta({
  title: 'app/blog/blog-layout/feedback',
  component: Feedback,
  args: {
    slug: 'media-pseudos',
  },
  // どの Story もトーストで終わる。トーストは数秒で自動で閉じるので、撮影の時機で
  // 写り方が変わらないよう外す
  parameters: { vrt: { remove: '[data-toast-id]' } },
});

export const Submit = meta.story({
  beforeEach: ({ msw }) => {
    msw.use(
      http.post(FEEDBACK_URL, async ({ params, request }) => {
        receivedFeedback({ slug: params['slug'], body: await request.json() });
        return new HttpResponse(null, { status: 204 });
      }),
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '良い' }));
    await userEvent.type(canvas.getByRole('textbox'), '参考になりました');
    await userEvent.click(canvas.getByRole('button', { name: '送信' }));

    await expect(
      await screen.findByText('フィードバックを送信しました！'),
    ).toBeInTheDocument();
    await expect(receivedFeedback).toHaveBeenCalledWith({
      slug: 'media-pseudos',
      body: { feedbackId: 1, comment: '参考になりました' },
    });
    await expect(
      await canvas.findByText('フィードバックありがとうございます！'),
    ).toBeInTheDocument();
  },
});

export const NotFound = meta.story({
  beforeEach: ({ msw }) => {
    msw.use(
      http.post(FEEDBACK_URL, () =>
        HttpResponse.json({ ok: false, error: 'not_found' }, { status: 404 }),
      ),
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '良い' }));
    await userEvent.click(canvas.getByRole('button', { name: '送信' }));

    await expect(
      await screen.findByText('指定されたブログが見つかりません'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: '送信' }),
    ).toBeInTheDocument();
  },
});

export const ServerError = meta.story({
  beforeEach: ({ msw }) => {
    msw.use(
      http.post(FEEDBACK_URL, () =>
        HttpResponse.json(
          { ok: false, error: 'internal_error' },
          { status: 500 },
        ),
      ),
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '良い' }));
    await userEvent.click(canvas.getByRole('button', { name: '送信' }));

    await expect(await screen.findByText(FAILED_MESSAGE)).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: '送信' }),
    ).toBeInTheDocument();
  },
});

export const NetworkError = meta.story({
  beforeEach: ({ msw }) => {
    msw.use(http.post(FEEDBACK_URL, () => HttpResponse.error()));
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '良い' }));
    await userEvent.click(canvas.getByRole('button', { name: '送信' }));

    await expect(await screen.findByText(FAILED_MESSAGE)).toBeInTheDocument();
  },
});
