import { formatDate } from '@repo/helpers/date/format';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Presenter } from './presenter';

const meta: Meta<typeof Presenter> = {
  title: 'app/globals/github-contribution-graph',
  component: Presenter,
};

export default meta;
type Story = StoryObj<typeof Presenter>;

export const Primary: Story = {
  args: {
    days: generateMockContributions(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const items = canvas.getAllByRole('listitem');
    await expect(items).toHaveLength(14);
    await expect(items[0]).toHaveAccessibleName(
      '2022年12月20日(火): 0件のコントリビューション',
    );
  },
};

export const DisplaysTitle: Story = {
  args: {
    days: generateMockContributions(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { name: '開発の足あと' }),
    ).toBeInTheDocument();
  },
};

export const DisplaysTotalContributions: Story = {
  args: {
    days: generateMockContributions(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/過去14日間で\d+件/u)).toBeInTheDocument();
  },
};

// CSS :hover はテストのsynthetic eventでは発火しないため、同じ表示機構をfocusで検証する
export const ShowsTooltipOnKeyboardFocus: Story = {
  args: {
    days: generateMockContributions(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const items = canvas.getAllByRole('listitem');
    const firstItem = items[0];
    if (firstItem === undefined) throw new Error('bar not found');
    // 先頭のフォーカス対象はグラフ説明のIconButtonなので2回タブを送る
    await userEvent.tab();
    await userEvent.tab();
    await expect(firstItem).toHaveFocus();
    await waitFor(async () => {
      await expect(
        within(firstItem).getByText('0件のコントリビューション'),
      ).toBeVisible();
    });
  },
};

export const HighActivity: Story = {
  args: {
    days: generateMockContributions(true),
  },
};

export const Empty: Story = {
  args: {
    days: generateMockContributions(false, true),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('過去14日間で0件')).toBeInTheDocument();
    const items = canvas.getAllByRole('listitem');
    await Promise.all(
      items.map((item) =>
        expect(item).toHaveAccessibleName(/0件のコントリビューション$/u),
      ),
    );
  },
};

// モバイルやグリッド内などグラフのコンテナが狭いケース（日付ラベルが1日おきに間引かれる）
export const Narrow: Story = {
  args: {
    days: generateMockContributions(),
  },
  decorators: [
    (Story) => (
      <div className="max-w-90">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const items = canvas.getAllByRole('listitem');
    await expect(items).toHaveLength(14);
  },
};

function generateMockContributions(highActivity = false, empty = false) {
  const days: Array<{ date: string; count: number }> = [];
  // args はモジュール評価時に実行され mockingDate decorator では固定できないため、
  // 実行日に依存しない固定基準日から14日分（2022-12-20〜2023-01-02）を生成する
  const startDate = new Date(2022, 11, 20);

  for (let i = 0; i <= 13; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

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
    // VRTのためStoryのデータは決定的に生成する（乱数を使わない）
    const count = (i * 7) % (maxContributions + 1);

    days.push({ date: formatDate(date, 'yyyy-MM-dd'), count });
  }

  return days;
}
