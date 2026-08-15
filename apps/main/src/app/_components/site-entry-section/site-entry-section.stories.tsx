import { expect, within } from 'storybook/test';

import { siteEntries } from '@/shared/site/site-entries';

import preview from '../../../../.storybook/preview';
import { SiteEntrySection } from './site-entry-section';

const meta = preview.meta({
  title: 'app/globals/site-entry-section',
  component: SiteEntrySection,
});

export const Tools = meta.story({
  args: { kind: 'tool' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { name: 'Tools' }),
    ).toBeInTheDocument();
    const toolCount = siteEntries.filter(
      (entry) => entry.kind === 'tool',
    ).length;
    await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(
      toolCount,
    );
  },
});

export const Explore = meta.story({
  args: { kind: 'reading' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { name: 'Explore' }),
    ).toBeInTheDocument();
    const readingCount = siteEntries.filter(
      (entry) => entry.kind === 'reading',
    ).length;
    await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(
      readingCount,
    );
  },
});
