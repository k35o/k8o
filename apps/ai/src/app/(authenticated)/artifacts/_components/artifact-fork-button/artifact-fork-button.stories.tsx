import { getRouter, redirect } from '@storybook/nextjs-vite/navigation.mock';
import { RedirectBoundary } from 'next/dist/client/components/redirect-boundary';
import type { ComponentProps } from 'react';
import {
  expect,
  fn,
  mocked,
  screen,
  userEvent,
  waitFor,
  within,
} from 'storybook/test';

import preview from '../../../../../../.storybook/preview';
import { ArtifactForkButton } from './artifact-fork-button';
import type { ArtifactForkAction } from './artifact-fork-button';

const ARTIFACT_ID = 'a1b2c3d4e5f6';

const meta = preview.meta({
  component: ArtifactForkButton,
  // 本番では、Toast を持つルートの AppProvider が、ページの segment の RedirectBoundary より外にある。Storybook は RedirectBoundary を AppProvider の外に置くので、移ると Toast まで作り直されて消える。本番と同じ入れ子にするため、内側にもう1つ置く
  decorators: [
    (Story) => (
      <RedirectBoundary>
        <Story />
      </RedirectBoundary>
    ),
  ],
  args: {
    artifactId: ARTIFACT_ID,
    version: 2,
    action: fn<ArtifactForkAction>(),
  } satisfies Partial<ComponentProps<typeof ArtifactForkButton>>,
});

export const Forking = meta.story({
  play: async ({ args, canvasElement }) => {
    const forking = Promise.withResolvers<undefined>();
    mocked(args.action).mockImplementation(() =>
      forking.promise.then(() => redirect('/artifacts/f6e5d4c3b2a1')),
    );
    const button = within(canvasElement).getByRole('button', {
      name: '版 2 をフォーク',
    });
    await userEvent.click(button);
    await expect(args.action).toHaveBeenCalledOnce();
    await expect(args.action).toHaveBeenCalledWith(ARTIFACT_ID, 2);
    // 移るまでのあいだは、押しても2つ目を作らない
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    await expect(args.action).toHaveBeenCalledOnce();

    // React は進んでいる async の transition をまとめて待つので、終わらない Promise を残すと、あとの Story の transition が止まる
    forking.resolve(undefined);
    await waitFor(() =>
      expect(getRouter().push).toHaveBeenCalledWith(
        '/artifacts/f6e5d4c3b2a1',
        {},
      ),
    );
  },
});

export const Forked = meta.story({
  play: async ({ args, canvasElement }) => {
    // フォークできたときは、action が新しい生成物のページへの redirect で終わる
    mocked(args.action).mockImplementation(() =>
      Promise.resolve().then(() => redirect('/artifacts/f6e5d4c3b2a1')),
    );
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: '版 2 をフォーク' }),
    );
    // redirect は Next の RedirectBoundary が受け取って移る
    await waitFor(() =>
      expect(getRouter().push).toHaveBeenCalledWith(
        '/artifacts/f6e5d4c3b2a1',
        {},
      ),
    );
    // フォークできたことは、Toast でも知らせる
    await expect(
      await screen.findByText('フォークしました'),
    ).toBeInTheDocument();
    await expect(
      screen.queryByText('フォークできませんでした'),
    ).not.toBeInTheDocument();
  },
});

export const Failed = meta.story({
  play: async ({ args, canvasElement }) => {
    mocked(args.action).mockResolvedValue();
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: '版 2 をフォーク' }),
    );
    await expect(
      await screen.findByText('フォークできませんでした'),
    ).toBeInTheDocument();
  },
});

export const Errored = meta.story({
  play: async ({ args, canvasElement }) => {
    // サーバーで action が例外で終わると、redirect でないエラーで reject される
    mocked(args.action).mockRejectedValue(
      new Error('An error occurred in the Server Components render.'),
    );
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: '版 2 をフォーク' }),
    );
    await expect(
      await screen.findByText('フォークできませんでした'),
    ).toBeInTheDocument();
    await expect(
      screen.queryByText('フォークしました'),
    ).not.toBeInTheDocument();
  },
});
