import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, within } from 'storybook/test';
import { Complete } from '.';

const meta: Meta<typeof Complete> = {
  title: 'app/quizzes/complete',
  component: Complete,
  args: {
    reset: fn(),
    quizzes: [],
  },
};

export default meta;
type Story = StoryObj<typeof Complete>;

export const Normal: Story = {
  args: {
    score: 75,
    maxCount: 100,
  },
};

export const Success: Story = {
  args: {
    score: 95,
    maxCount: 100,
  },
};

export const Warning: Story = {
  args: {
    score: 50,
    maxCount: 100,
  },
};

export const Error: Story = {
  args: {
    score: 25,
    maxCount: 100,
  },
};

export const DisplaysScoreText: Story = {
  args: {
    score: 8,
    maxCount: 10,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // クイズ終了が表示されていることを確認
    await expect(canvas.getByText('クイズ終了')).toBeInTheDocument();

    // スコアが正しく表示されていることを確認
    await expect(canvas.getByText('スコア: 8/10')).toBeInTheDocument();
  },
};

export const ClickResetButton: Story = {
  args: {
    score: 8,
    maxCount: 10,
    reset: fn(),
  },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);

    // もう一度挑戦するボタンをクリック
    const resetButton = canvas.getByRole('button', {
      name: 'もう一度挑戦する',
    });
    await userEvent.click(resetButton);

    // reset関数が呼ばれたことを確認
    await expect(args.reset).toHaveBeenCalled();
  },
};

export const HasListLink: Story = {
  args: {
    score: 8,
    maxCount: 10,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // うおへんの漢字一覧リンクが存在することを確認
    const listLink = canvas.getByRole('link', { name: 'うおへんの漢字一覧' });
    await expect(listLink).toBeInTheDocument();
  },
};
