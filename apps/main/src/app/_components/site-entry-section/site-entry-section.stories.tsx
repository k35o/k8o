import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { siteEntries } from '@/shared/site/site-entries';

import { SiteEntrySection } from './site-entry-section';

const meta: Meta<typeof SiteEntrySection> = {
  title: 'app/globals/site-entry-section',
  component: SiteEntrySection,
};

export default meta;
type Story = StoryObj<typeof SiteEntrySection>;

export const Tools: Story = {
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
};

export const Reading: Story = {
  args: { kind: 'reading' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { name: 'Reading' }),
    ).toBeInTheDocument();
    const readingCount = siteEntries.filter(
      (entry) => entry.kind === 'reading',
    ).length;
    await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(
      readingCount,
    );
  },
};
