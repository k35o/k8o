import { HttpResponse, http } from 'msw';
import { expect, fn, spyOn } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { PushSubscribe } from './push-subscribe';

const SUBSCRIPTIONS_URL = 'https://api.k8o.me/public/push-subscriptions';
const ENDPOINT = 'https://fcm.googleapis.com/fcm/send/storybook';
const P256DH =
  'BAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE';
const AUTH = 'AgICAgICAgICAgICAgICAg';

const unsubscribeInBrowser = fn(() => Promise.resolve(true));
const receivedSubscription = fn();
const receivedUnsubscription = fn();

// Push サービスには繋がないので、ブラウザの購読は偽物に差し替える
const browserSubscription = {
  endpoint: ENDPOINT,
  toJSON: () => ({ endpoint: ENDPOINT, keys: { p256dh: P256DH, auth: AUTH } }),
  unsubscribe: unsubscribeInBrowser,
} as unknown as PushSubscription;

const meta = preview.meta({
  title: 'app/notifications/push-subscribe',
  component: PushSubscribe,
  args: {
    vapidPublicKey: P256DH,
  },
  beforeEach: () => {
    spyOn(PushManager.prototype, 'getSubscription').mockResolvedValue(null);
    spyOn(PushManager.prototype, 'subscribe').mockResolvedValue(
      browserSubscription,
    );
  },
});

export const Subscribe = meta.story({
  beforeEach: ({ msw }) => {
    msw.use(
      http.post(SUBSCRIPTIONS_URL, async ({ request }) => {
        receivedSubscription(await request.json());
        return new HttpResponse(null, { status: 204 });
      }),
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      await canvas.findByRole('button', { name: '通知を受け取る' }),
    );

    await expect(
      await canvas.findByText('通知を購読中です'),
    ).toBeInTheDocument();
    await expect(receivedSubscription).toHaveBeenCalledWith({
      endpoint: ENDPOINT,
      keys: { p256dh: P256DH, auth: AUTH },
    });
    await expect(unsubscribeInBrowser).not.toHaveBeenCalled();
  },
});

export const SubscribeRejected = meta.story({
  beforeEach: ({ msw }) => {
    msw.use(
      http.post(SUBSCRIPTIONS_URL, () =>
        HttpResponse.json(
          { ok: false, error: 'endpoint_not_allowed' },
          { status: 400 },
        ),
      ),
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      await canvas.findByRole('button', { name: '通知を受け取る' }),
    );

    await expect(
      await canvas.findByText('許可されていない通知エンドポイントです'),
    ).toBeInTheDocument();
    // api に登録できなかった購読はブラウザにも残さない
    await expect(unsubscribeInBrowser).toHaveBeenCalled();
  },
});

export const SubscribeNetworkError = meta.story({
  beforeEach: ({ msw }) => {
    msw.use(http.post(SUBSCRIPTIONS_URL, () => HttpResponse.error()));
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      await canvas.findByRole('button', { name: '通知を受け取る' }),
    );

    await expect(
      await canvas.findByText('購読の登録に失敗しました'),
    ).toBeInTheDocument();
    await expect(unsubscribeInBrowser).toHaveBeenCalled();
  },
});

export const Unsubscribe = meta.story({
  beforeEach: ({ msw }) => {
    spyOn(PushManager.prototype, 'getSubscription').mockResolvedValue(
      browserSubscription,
    );
    msw.use(
      http.delete(SUBSCRIPTIONS_URL, async ({ request }) => {
        receivedUnsubscription(await request.json());
        return new HttpResponse(null, { status: 204 });
      }),
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      await canvas.findByRole('button', { name: '購読を解除する' }),
    );

    await expect(
      await canvas.findByRole('button', { name: '通知を受け取る' }),
    ).toBeInTheDocument();
    await expect(receivedUnsubscription).toHaveBeenCalledWith({
      endpoint: ENDPOINT,
      auth: AUTH,
    });
    await expect(unsubscribeInBrowser).toHaveBeenCalled();
  },
});

export const UnsubscribeFailure = meta.story({
  beforeEach: ({ msw }) => {
    spyOn(PushManager.prototype, 'getSubscription').mockResolvedValue(
      browserSubscription,
    );
    msw.use(
      http.delete(SUBSCRIPTIONS_URL, () =>
        HttpResponse.json(
          { ok: false, error: 'internal_error' },
          { status: 500 },
        ),
      ),
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      await canvas.findByRole('button', { name: '購読を解除する' }),
    );

    await expect(
      await canvas.findByText('購読の解除に失敗しました'),
    ).toBeInTheDocument();
    // api から消せなかったときは、ブラウザの購読も残して購読中のままにする
    await expect(unsubscribeInBrowser).not.toHaveBeenCalled();
    await expect(canvas.getByText('通知を購読中です')).toBeInTheDocument();
  },
});
