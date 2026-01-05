import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { GitHubContributionGraphClient } from './github-contribution-graph-client';

const meta: Meta<typeof GitHubContributionGraphClient> = {
  title: 'app/globals/github-contribution-graph',
  component: GitHubContributionGraphClient,
};

export default meta;
type Story = StoryObj<typeof GitHubContributionGraphClient>;

/**
 * デフォルトの状態
 */
export const Primary: Story = {
  args: {
    weeks: generateMockContributions(),
  },
};

/**
 * タイトルが表示されることを確認
 */
export const DisplaysTitle: Story = {
  args: {
    weeks: generateMockContributions(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // タイトルが表示されることを確認
    await expect(
      canvas.getByRole('heading', { name: 'GitHub Contributions' }),
    ).toBeInTheDocument();
  },
};

/**
 * Contributionの総数が表示されることを確認
 */
export const DisplaysTotalContributions: Story = {
  args: {
    weeks: generateMockContributions(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // "contributions" テキストが表示されることを確認
    await expect(canvas.getByText(/contributions/i)).toBeInTheDocument();
  },
};

/**
 * Less/Moreのラベルが表示されることを確認
 */
export const DisplaysLegend: Story = {
  args: {
    weeks: generateMockContributions(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // "Less" と "More" が表示されることを確認
    await expect(canvas.getByText('Less')).toBeInTheDocument();
    await expect(canvas.getByText('More')).toBeInTheDocument();
  },
};

/**
 * 高活動レベルの状態
 */
export const HighActivity: Story = {
  args: {
    weeks: generateMockContributions(true),
  },
};

/**
 * 空の状態
 */
export const Empty: Story = {
  args: {
    weeks: generateMockContributions(false, true),
  },
};

/**
 * モックのContributionデータを生成
 */
function generateMockContributions(highActivity = false, empty = false) {
  const weeks: Array<{
    days: Array<{ date: string; count: number; level: number }>;
  }> = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 364); // 1年前

  for (let weekIndex = 0; weekIndex < 53; weekIndex++) {
    const days: Array<{ date: string; count: number; level: number }> = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + weekIndex * 7 + dayIndex);

      // ランダムなcontribution数を生成(週末は少なめ)
      const isWeekend = dayIndex === 0 || dayIndex === 6;
      const maxContributions = empty
        ? 0
        : highActivity
          ? isWeekend
            ? 10
            : 25
          : isWeekend
            ? 5
            : 15;
      const count = Math.floor(Math.random() * maxContributions);

      // countからlevelを計算
      let level = 0;
      if (count > 0 && count <= 3) level = 1;
      else if (count > 3 && count <= 6) level = 2;
      else if (count > 6 && count <= 9) level = 3;
      else if (count > 9) level = 4;

      const dateString = date.toISOString().split('T')[0];
      if (dateString) {
        days.push({
          date: dateString,
          count,
          level,
        });
      }
    }
    weeks.push({ days });
  }

  return weeks;
}
