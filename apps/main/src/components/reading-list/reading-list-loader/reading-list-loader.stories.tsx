import { ListIcon } from '@k8ordo/ui';
import { HttpResponse, http } from 'msw/http';
import { Suspense, useState } from 'react';
import type { FC, ReactNode } from 'react';
import { expect, fn, userEvent, waitFor } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { resetReadingList } from '../reading-list-source/reading-list-source';
import type { ReadingList } from '../reading-list-source/reading-list-source';
import { ReadingListLoader } from './reading-list-loader';

const READING_LIST_URL = 'https://api.k8o.me/public/reading-list';

const readingList: ReadingList = {
  articles: [
    {
      id: 2,
      title: 'TanStack Routerで型安全なルーティング',
      url: 'https://zenn.dev/example/articles/tanstack-router',
      publishedAt: '2026-10-20T00:00:00.000Z',
      imageUrl: null,
      description: 'TanStack Routerの使い方を紹介します。',
      summary: null,
      source: { id: 1, title: 'Zenn', siteUrl: 'https://zenn.dev' },
    },
    {
      id: 1,
      title: 'Baseline 2026 のふりかえり',
      url: 'https://web.dev/articles/baseline-2026',
      publishedAt: '2026-10-18T00:00:00.000Z',
      imageUrl: null,
      description: null,
      summary: '2026年に Baseline に入った機能をまとめた記事。',
      source: { id: 2, title: 'web.dev', siteUrl: 'https://web.dev' },
    },
  ],
  sources: [
    { id: 1, title: 'Zenn' },
    { id: 2, title: 'web.dev' },
  ],
};

const requested = fn();

// ページでは BrowserOnly の骨組みが fallback になる
const Fallback: FC<{ children: ReactNode }> = ({ children }) => (
  <Suspense fallback={<p>骨組み</p>}>{children}</Suspense>
);

const meta = preview.meta({
  title: 'app/reading-list/reading-list-loader',
  component: ReadingListLoader,
  args: { filterIcon: <ListIcon /> },
  beforeEach: () => {
    requested.mockClear();
    resetReadingList();
  },
  decorators: [
    (Story: FC) => (
      <Fallback>
        <Story />
      </Fallback>
    ),
  ],
});

// 正常系: api が届くまで fallback を出し、届いたら一覧を描く
export const Loaded = meta.story({
  beforeEach: ({ msw }) => {
    msw.use(
      http.get(READING_LIST_URL, () => {
        requested();
        return HttpResponse.json(readingList);
      }),
    );
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('2件の記事')).toBeInTheDocument();
    await expect(
      canvas.getByText('TanStack Routerで型安全なルーティング'),
    ).toBeInTheDocument();
    await expect(requested).toHaveBeenCalledOnce();
  },
});

// 正常系: 届くまでは fallback のままで、0 件の一覧を描かない
export const WaitsForResponse = meta.story({
  parameters: { vrt: { skip: true } },
  beforeEach: ({ msw }) => {
    const { promise, resolve } = Promise.withResolvers<undefined>();
    msw.use(
      http.get(READING_LIST_URL, async () => {
        requested();
        await promise;
        return HttpResponse.json(readingList);
      }),
    );
    return () => {
      resolve(undefined);
    };
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('骨組み')).toBeInTheDocument();
    await expect(canvas.queryByText(/件の記事/u)).not.toBeInTheDocument();
  },
});

const failure = (): Response =>
  HttpResponse.json({ ok: false, error: 'internal_error' }, { status: 500 });

let releaseRetry = (): void => {};

// 異常系: 読めなければ案内を出す。もう一度読み込むと、待つあいだも案内を出したまま骨組みに戻らず、
// preload を通さずに読んで一覧を描く
export const RetryAfterFailure = meta.story({
  parameters: { vrt: { skip: true } },
  beforeEach: ({ msw }) => {
    const { promise, resolve } = Promise.withResolvers<undefined>();
    releaseRetry = () => {
      resolve(undefined);
    };
    msw.use(
      http.get(READING_LIST_URL, async ({ request }) => {
        requested(request.cache);
        if (requested.mock.calls.length === 1) {
          return failure();
        }
        await promise;
        return HttpResponse.json(readingList);
      }),
    );
    return releaseRetry;
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText(/記事を読み込めませんでした/u),
    ).toBeInTheDocument();
    const retry = canvas.getByRole('button', { name: 'もう一度読み込む' });

    // userEvent は act の中で押すので、更新で suspend した描画が再開しない。ブラウザと同じく act の外で押す
    retry.click();

    await waitFor(async () => {
      await expect(retry).toHaveAttribute('aria-busy', 'true');
    });
    await expect(canvas.queryByText('骨組み')).not.toBeInTheDocument();
    await expect(
      canvas.getByText(/記事を読み込めませんでした/u),
    ).toBeInTheDocument();

    releaseRetry();
    await expect(await canvas.findByText('2件の記事')).toBeInTheDocument();
    await expect(requested.mock.calls).toStrictEqual([['default'], ['reload']]);
  },
});

export const Failed = meta.story({
  beforeEach: ({ msw }) => {
    msw.use(http.get(READING_LIST_URL, failure));
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText(/記事を読み込めませんでした/u),
    ).toBeInTheDocument();
  },
});

// 戻る・進むで描き直すときと同じく、外して描き直す
const Remount: FC<{ children: ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(true);
  return (
    <>
      <button
        onClick={() => {
          setMounted(!mounted);
        }}
        type="button"
      >
        {mounted ? '外す' : '描き直す'}
      </button>
      {mounted ? children : null}
    </>
  );
};

// 正常系: 一度読んだ一覧は、描き直すときに api を読み直さず、fallback も出さない
export const ReusesLoadedList = meta.story({
  parameters: { vrt: { skip: true } },
  decorators: [
    (Story: FC) => (
      <Remount>
        <Story />
      </Remount>
    ),
  ],
  beforeEach: ({ msw }) => {
    msw.use(
      http.get(READING_LIST_URL, () => {
        requested();
        return HttpResponse.json(readingList);
      }),
    );
  },
  play: async ({ canvas }) => {
    await canvas.findByText('2件の記事');

    await userEvent.click(canvas.getByRole('button', { name: '外す' }));
    await userEvent.click(canvas.getByRole('button', { name: '描き直す' }));

    await expect(canvas.getByText('2件の記事')).toBeInTheDocument();
    await expect(canvas.queryByText('骨組み')).not.toBeInTheDocument();
    await expect(requested).toHaveBeenCalledOnce();
  },
});

// 異常系: 読めなかった結果は覚えず、あとで開き直したときに preload を通さずに読み直す
export const RefetchesAfterFailure = meta.story({
  parameters: { vrt: { skip: true } },
  decorators: [
    (Story: FC) => (
      <Remount>
        <Story />
      </Remount>
    ),
  ],
  beforeEach: ({ msw }) => {
    msw.use(
      http.get(READING_LIST_URL, ({ request }) => {
        requested(request.cache);
        return requested.mock.calls.length === 1
          ? failure()
          : HttpResponse.json(readingList);
      }),
    );
  },
  play: async ({ canvas }) => {
    await canvas.findByText(/記事を読み込めませんでした/u);

    await userEvent.click(canvas.getByRole('button', { name: '外す' }));
    // 描き直すと読み直しで suspend するので、RetryAfterFailure と同じく act の外で押す
    canvas.getByRole('button', { name: '描き直す' }).click();

    await expect(await canvas.findByText('2件の記事')).toBeInTheDocument();
    await expect(requested.mock.calls).toStrictEqual([['default'], ['reload']]);
  },
});

// 異常系: 読み直しも読めなければ案内に戻り、もう一度読み込むと読み直す
export const RetryAfterRepeatedFailure = meta.story({
  parameters: { vrt: { skip: true } },
  beforeEach: ({ msw }) => {
    msw.use(
      http.get(READING_LIST_URL, ({ request }) => {
        requested(request.cache);
        return requested.mock.calls.length < 3
          ? failure()
          : HttpResponse.json(readingList);
      }),
    );
  },
  play: async ({ canvas }) => {
    await canvas.findByText(/記事を読み込めませんでした/u);
    const retry = canvas.getByRole('button', { name: 'もう一度読み込む' });

    // RetryAfterFailure と同じく act の外で押す
    retry.click();
    await waitFor(async () => {
      await expect(requested).toHaveBeenCalledTimes(2);
    });
    await waitFor(async () => {
      await expect(retry).not.toHaveAttribute('aria-busy', 'true');
    });
    await expect(
      canvas.getByText(/記事を読み込めませんでした/u),
    ).toBeInTheDocument();

    retry.click();

    await expect(await canvas.findByText('2件の記事')).toBeInTheDocument();
    await expect(requested.mock.calls).toStrictEqual([
      ['default'],
      ['reload'],
      ['reload'],
    ]);
  },
});
