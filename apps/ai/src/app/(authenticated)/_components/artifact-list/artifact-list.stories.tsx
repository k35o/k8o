import type { ComponentProps } from 'react';
import { expect, within } from 'storybook/test';

import type { ArtifactListItem } from '@/features/artifacts/interface/queries';

import preview from '../../../../../.storybook/preview';
import { ArtifactList } from './artifact-list';

import styles from './artifact-list.stories.module.css';

const artifacts: ArtifactListItem[] = [
  {
    id: 'a1b2c3d4e5f6',
    kind: 'ui',
    title: '料金表',
    updatedAt: '2026-10-14T00:30:00.000Z',
    isPublic: true,
  },
  {
    id: 's1t2u3v4w5x6',
    kind: 'slides',
    title: 'TypeScript 入門',
    updatedAt: '2026-10-13T12:05:00.000Z',
    isPublic: false,
  },
];

const meta = preview.meta({
  component: ArtifactList,
  decorators: [
    (Story) => (
      <div className={styles.frame}>
        <Story />
      </div>
    ),
  ],
  args: {
    artifacts,
    currentArtifactId: 's1t2u3v4w5x6',
  } satisfies Partial<ComponentProps<typeof ArtifactList>>,
});

export const Empty = meta.story({
  args: { artifacts: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(
        'まだ作ったものはありません。チャットで UI やスライドを頼むと、ここに並びます。',
      ),
    ).toBeInTheDocument();
  },
});

export const WithArtifacts = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const ui = canvas.getByRole('link', { name: /料金表/u });
    await expect(ui).toHaveAttribute('href', '/artifacts/a1b2c3d4e5f6');
    await expect(ui).not.toHaveAttribute('aria-current');
    await expect(within(ui).getByText('UI')).toBeInTheDocument();
    // 公開中のものに印を付ける
    await expect(within(ui).getByText('公開')).toBeInTheDocument();

    const current = canvas.getByRole('link', { name: /TypeScript 入門/u });
    await expect(current).toHaveAttribute('href', '/artifacts/s1t2u3v4w5x6');
    await expect(current).toHaveAttribute('aria-current', 'page');
    await expect(within(current).getByText('スライド')).toBeInTheDocument();
    await expect(within(current).queryByText('公開')).not.toBeInTheDocument();
  },
});
