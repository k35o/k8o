import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
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
    await expect(canvas.getByText(/件/)).toBeInTheDocument();
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
};

function generateMockContributions(highActivity = false, empty = false) {
  const days: Array<{ date: string; count: number }> = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 13);

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
    const count = Math.floor(Math.random() * maxContributions);

    const dateString = date.toISOString().split('T')[0];
    if (dateString) {
      days.push({ date: dateString, count });
    }
  }

  return days;
}
