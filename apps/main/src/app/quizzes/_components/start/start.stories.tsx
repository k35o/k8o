import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { Start } from './start';

const meta: Meta<typeof Start> = {
  title: 'app/quizzes/start',
  component: Start,
};

export default meta;
type Story = StoryObj<typeof Start>;

export const Primary: Story = {
  args: {},
};

export const DisplaysQuizTypeLabel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 種類ラベルが表示されていることを確認
    await expect(canvas.getByText('種類')).toBeInTheDocument();
  },
};

export const DisplaysQuestionCountField: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 問題数のフィールドが表示されていることを確認
    await expect(canvas.getByText('問題数')).toBeInTheDocument();
    await expect(
      canvas.getByText('数値が問題数を超える場合は全ての問題が出題されます'),
    ).toBeInTheDocument();
  },
};

export const HasStartButton: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // スタートリンクが存在することを確認
    const startLink = canvas.getByRole('link', { name: 'スタート' });
    await expect(startLink).toBeInTheDocument();
  },
};

export const ChangeQuestionCount: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // 問題数を変更
    const spinbutton = canvas.getByRole('spinbutton', { name: '問題数' });
    await userEvent.clear(spinbutton);
    await userEvent.type(spinbutton, '5');

    // 入力値を確認
    await expect(spinbutton).toHaveValue(5);
  },
};
