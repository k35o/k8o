import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { Presenter } from './presenter';

const meta: Meta<typeof Presenter> = {
  title: 'app/globals/github-contribution-graph',
  component: Presenter,
};

export default meta;
type Story = StoryObj<typeof Presenter>;

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
 * -/+のラベルが表示されることを確認
 */
export const DisplaysLegend: Story = {
  args: {
    weeks: generateMockContributions(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // "-" と "+" が表示されることを確認
    await expect(canvas.getByText('-')).toBeInTheDocument();
    await expect(canvas.getByText('+')).toBeInTheDocument();
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
 * モックのContributionデータを生成（直近10週間）
 */
function generateMockContributions(highActivity = false, empty = false) {
  const weeks: Array<{
    days: Array<{ date: string; count: number; level: number }>;
  }> = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 49); // 10週間前（50日分）

  let currentWeek: Array<{ date: string; count: number; level: number }> = [];

  for (let i = 0; i <= 49; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    // ランダムなcontribution数を生成(週末は少なめ)
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
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
      currentWeek.push({
        date: dateString,
        count,
        level,
      });
    }

    // 5日ごとまたは最後の日付でweekを区切る
    if (currentWeek.length === 5 || i === 49) {
      weeks.push({ days: [...currentWeek] });
      currentWeek = [];
    }
  }

  return weeks;
}
