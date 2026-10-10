import { HttpResponse, http } from 'msw';
import { expect, fn, screen, waitFor } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { ContactToMe } from './contact-to-me';

const INQUIRIES_URL = 'https://api.k8o.me/public/inquiries';
const MESSAGE = 'ページの表示が崩れています';
const FAILED_MESSAGE =
  'お問い合わせの送信に失敗しました。しばらくしてから再度お試しください。';

const receivedInquiry = fn();

const meta = preview.meta({
  title: 'app/globals/contact-to-me',
  component: ContactToMe,
});

export const Primary = meta.story();

export const Open = meta.story({
  play: ({ canvas }) => {
    const button = canvas.getByRole('button', {
      name: 'お問い合わせ',
    });
    button.click();
  },
});

export const Submit = meta.story({
  // トーストは数秒で自動で閉じるので、撮影の時機で写り方が変わらないよう外す
  parameters: { vrt: { remove: '[data-toast-id]' } },
  beforeEach: ({ msw }) => {
    msw.use(
      http.post(INQUIRIES_URL, async ({ request }) => {
        receivedInquiry(await request.json());
        return new HttpResponse(null, { status: 204 });
      }),
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'お問い合わせ' }));
    await userEvent.type(
      await canvas.findByRole('textbox', {
        name: '不具合やご要望をご記入ください',
      }),
      MESSAGE,
    );
    await userEvent.click(canvas.getByRole('button', { name: '送信' }));

    await expect(
      await screen.findByText('お問い合わせの送信に成功しました'),
    ).toBeInTheDocument();
    await expect(receivedInquiry).toHaveBeenCalledWith({ message: MESSAGE });
    await waitFor(async () => {
      await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    });
  },
});

export const TooLongMessage = meta.story({
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'お問い合わせ' }));
    const textbox = await canvas.findByRole('textbox', {
      name: '不具合やご要望をご記入ください',
    });
    await userEvent.click(textbox);
    await userEvent.paste('あ'.repeat(256));
    await userEvent.click(canvas.getByRole('button', { name: '送信' }));

    await waitFor(async () => {
      await expect(textbox).toBeInvalid();
    });
    await expect(textbox).toHaveAccessibleDescription(
      '255文字を超えています（256文字）',
    );
    await expect(textbox).toHaveValue('あ'.repeat(256));
  },
});

export const SubmitFailureKeepsMessage = meta.story({
  beforeEach: ({ msw }) => {
    msw.use(
      http.post(INQUIRIES_URL, () =>
        HttpResponse.json(
          { ok: false, error: 'internal_error' },
          { status: 500 },
        ),
      ),
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'お問い合わせ' }));
    await userEvent.type(
      await canvas.findByRole('textbox', {
        name: '不具合やご要望をご記入ください',
      }),
      MESSAGE,
    );
    await userEvent.click(canvas.getByRole('button', { name: '送信' }));

    await expect(await canvas.findByText(FAILED_MESSAGE)).toBeInTheDocument();
    // 送れなかった本文は消さず、そのまま再送できるようにする
    await expect(
      canvas.getByRole('textbox', { name: '不具合やご要望をご記入ください' }),
    ).toHaveValue(MESSAGE);
  },
});

export const NetworkErrorKeepsMessage = meta.story({
  beforeEach: ({ msw }) => {
    msw.use(http.post(INQUIRIES_URL, () => HttpResponse.error()));
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'お問い合わせ' }));
    await userEvent.type(
      await canvas.findByRole('textbox', {
        name: '不具合やご要望をご記入ください',
      }),
      MESSAGE,
    );
    await userEvent.click(canvas.getByRole('button', { name: '送信' }));

    await expect(await canvas.findByText(FAILED_MESSAGE)).toBeInTheDocument();
    await expect(
      canvas.getByRole('textbox', { name: '不具合やご要望をご記入ください' }),
    ).toHaveValue(MESSAGE);
  },
});
