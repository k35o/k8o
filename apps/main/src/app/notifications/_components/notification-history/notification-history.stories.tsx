import { HttpResponse, http } from 'msw/http';
import { expect, fn, waitFor } from 'storybook/test';

import type { PushLogs } from '@/features/push-notification/interface/queries';

import preview from '../../../../../.storybook/preview';
import { NotificationHistory } from './notification-history';

const PUSH_LOGS_URL = 'https://api.k8o.me/public/push-logs';

const buildTime: PushLogs = {
  logs: [
    {
      id: 2,
      kind: 'browser_support_updated',
      title: 'Browser Support更新',
      body: 'Newly: 1件',
      url: 'https://k8o.me/browser-support',
      sentAt: '2026-10-16T06:00:01.857Z',
    },
    {
      id: 1,
      kind: 'browser_support_alert',
      title: 'Browser Support: 最低対応バージョンが変化',
      body: 'v3.39.0 でブラウザ最低版フロアが変わりました。',
      url: 'https://k8o.me/browser-support',
      sentAt: '2026-09-18T06:30:07.528Z',
    },
  ],
};

// ビルドのあと、reading-list の同期の通知が1件届いた
const latest: PushLogs = {
  logs: [
    {
      id: 3,
      kind: 'readings_updated',
      title: 'フィード取得完了',
      body: '6件追加、0件更新',
      url: 'https://k8o.me/reading-list',
      sentAt: '2026-10-23T00:00:38.052Z',
    },
    ...buildTime.logs,
  ],
};

const requested = fn();

const meta = preview.meta({
  title: 'app/notifications/notification-history',
  component: NotificationHistory,
  args: { pushLogs: buildTime },
  beforeEach: () => {
    requested.mockClear();
  },
});

export const Replaced = meta.story({
  beforeEach: ({ msw }) => {
    msw.use(http.get(PUSH_LOGS_URL, () => HttpResponse.json(latest)));
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText('フィード取得完了'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('2026年10月23日(金) 09:00'),
    ).toBeInTheDocument();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
  },
});

export const KeepsBuildTimeOnFailure = meta.story({
  beforeEach: ({ msw }) => {
    msw.use(
      http.get(PUSH_LOGS_URL, () => {
        requested();
        return HttpResponse.json(
          { ok: false, error: 'internal_error' },
          { status: 500 },
        );
      }),
    );
  },
  play: async ({ canvas }) => {
    await waitFor(async () => {
      await expect(requested).toHaveBeenCalledOnce();
    });
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    await expect(canvas.getByText('Browser Support更新')).toBeInTheDocument();
    await expect(
      canvas.queryByText('フィード取得完了'),
    ).not.toBeInTheDocument();
  },
});

export const Empty = meta.story({
  args: { pushLogs: { logs: [] } },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText('まだ通知の履歴はありません。'),
    ).toBeInTheDocument();
  },
});

// ビルドのときに履歴が無くても、そのあとに届いた通知は差し替えで出す
export const ReplacedFromEmpty = meta.story({
  args: { pushLogs: { logs: [] } },
  beforeEach: ({ msw }) => {
    msw.use(http.get(PUSH_LOGS_URL, () => HttpResponse.json(latest)));
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText('フィード取得完了'),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByText('まだ通知の履歴はありません。'),
    ).not.toBeInTheDocument();
  },
});
