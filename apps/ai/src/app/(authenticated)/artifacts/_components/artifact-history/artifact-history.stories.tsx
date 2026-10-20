import { useLinkStatus } from '@storybook/nextjs-vite/link.mock';
import type { ComponentProps } from 'react';
import { expect, within } from 'storybook/test';

import type { LoadedArtifact } from '@/features/artifacts/interface/queries';

import preview from '../../../../../../.storybook/preview';
import { ArtifactHistory } from './artifact-history';

import styles from './artifact-history.stories.module.css';

const THREAD_ID = '6f1c2a4e-0b7d-4c55-9a3e-2f8d1b6c9e01';

const versions: LoadedArtifact['versions'] = [
  {
    version: 3,
    title: '料金表',
    instruction: '年払いの列を足して',
    summary: '年払いの価格を並べました。',
    threadId: null,
    createdAt: '2026-10-15T03:00:00.000Z',
    origin: { type: 'edit', version: 1 },
  },
  {
    version: 2,
    title: '料金表',
    instruction: 'おすすめのプランを目立たせて',
    summary: 'おすすめのプランに印を付けました。',
    threadId: THREAD_ID,
    createdAt: '2026-10-14T03:00:00.000Z',
    origin: { type: 'edit', version: 1 },
  },
  {
    version: 1,
    title: '料金表',
    instruction: '3つのプランを比べる料金表',
    summary: '3列の料金表を作りました。',
    threadId: THREAD_ID,
    createdAt: '2026-10-13T03:00:00.000Z',
    origin: { type: 'new' },
  },
];

const meta = preview.meta({
  component: ArtifactHistory,
  decorators: [
    (Story) => (
      <div className={styles.frame}>
        <Story />
      </div>
    ),
  ],
  args: {
    artifactId: 'a1b2c3d4e5f6',
    versions,
    selectedVersion: 2,
    publicVersion: null,
  } satisfies Partial<ComponentProps<typeof ArtifactHistory>>,
});

export const Default = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const history = within(canvas.getByRole('region', { name: '版の履歴' }));

    const selected = history.getByRole('link', { name: /^版 2(?!を)/u });
    await expect(selected).toHaveAttribute(
      'href',
      '/artifacts/a1b2c3d4e5f6?v=2',
    );
    await expect(selected).toHaveAttribute('aria-current', 'page');
    await expect(within(selected).getByText('版 1 から')).toBeInTheDocument();
    await expect(
      within(selected).getByText('おすすめのプランを目立たせて'),
    ).toBeInTheDocument();
    // 作った日時は日本時間で出す
    await expect(within(selected).getByText('10/14 12:00')).toBeInTheDocument();
    // 要約は、選んでいる版にだけ出す
    await expect(
      history.getByText('おすすめのプランに印を付けました。'),
    ).toBeInTheDocument();
    await expect(
      history.queryByText('3列の料金表を作りました。'),
    ).not.toBeInTheDocument();

    const first = history.getByRole('link', { name: /^版 1(?!を)/u });
    await expect(first).toHaveAttribute('href', '/artifacts/a1b2c3d4e5f6?v=1');
    await expect(first).not.toHaveAttribute('aria-current');
    // 新しく作った版は、由来を出さない
    await expect(within(first).queryByText(/から$/u)).not.toBeInTheDocument();
    // 公開していなければ、どの版にも公開の印を出さない
    await expect(history.queryByText('公開中')).not.toBeInTheDocument();
  },
});

export const Published = meta.story({
  args: { publicVersion: 3 },
  play: async ({ canvasElement }) => {
    const history = within(canvasElement);
    // 公開している版の行にだけ、選んでいる版でなくても印を出す
    await expect(
      within(history.getByRole('link', { name: /^版 3(?!を)/u })).getByText(
        '公開中',
      ),
    ).toBeInTheDocument();
    await expect(history.getAllByText('公開中')).toHaveLength(1);
  },
});

export const ThreadLinks = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('link', { name: '版 2を作った会話を開く' }),
    ).toHaveAttribute('href', `/chat/${THREAD_ID}`);
    await expect(
      canvas.getByRole('link', { name: '版 1を作った会話を開く' }),
    ).toHaveAttribute('href', `/chat/${THREAD_ID}`);
    // 会話の無い版には、会話へのリンクを出さない
    await expect(
      canvas.queryByRole('link', { name: '版 3を作った会話を開く' }),
    ).not.toBeInTheDocument();
  },
});

export const Pending = meta.story({
  beforeEach: () => {
    useLinkStatus.mockReturnValue({ pending: true });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 押した行は、次の版が届くまで背景を変えて、待っていることを示す
    const row = canvas.getByRole('link', { name: /^版 1(?!を)/u });
    await expect(getComputedStyle(row).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    );
  },
});
