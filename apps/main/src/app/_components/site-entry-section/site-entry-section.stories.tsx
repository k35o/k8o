import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

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

    // セクション見出しとツールのカードが描画されていることを確認
    await expect(
      canvas.getByRole('heading', { name: 'Tools' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('heading', { name: 'Baseline' }),
    ).toBeInTheDocument();
  },
};

export const Reading: Story = {
  args: { kind: 'reading' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // セクション見出しと読みもののカードが描画されていることを確認
    await expect(
      canvas.getByRole('heading', { name: 'Reading' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('heading', { name: 'Blog' }),
    ).toBeInTheDocument();
  },
};
