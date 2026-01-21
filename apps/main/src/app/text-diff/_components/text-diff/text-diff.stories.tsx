import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { TextDiff } from './text-diff';

const meta: Meta<typeof TextDiff> = {
  title: 'app/text-diff/text-diff',
  component: TextDiff,
};

export default meta;
type Story = StoryObj<typeof TextDiff>;

export const Primary: Story = {};

export const JapaneseTextDiff: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // 変更前のテキストを入力
    const beforeField = canvas.getByRole('textbox', { name: '変更前' });
    await userEvent.type(beforeField, 'こんにちは');

    // 変更後のテキストを入力
    const afterField = canvas.getByRole('textbox', { name: '変更後' });
    await userEvent.type(afterField, 'こんばんは');

    // 差分が表示されることを確認
    await expect(canvas.getByText('こん')).toBeInTheDocument();
    await expect(canvas.getByText('にち')).toBeInTheDocument();
    await expect(canvas.getByText('ばん')).toBeInTheDocument();
    await expect(canvas.getByText('は')).toBeInTheDocument();
  },
};

export const EnglishTextDiff: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    const beforeField = canvas.getByRole('textbox', { name: '変更前' });
    await userEvent.type(beforeField, 'Hello World');

    const afterField = canvas.getByRole('textbox', { name: '変更後' });
    await userEvent.type(afterField, 'Hello Japan');

    // 差分が表示されることを確認
    // getAllByTextで複数マッチを許容（テキストエリアと差分表示の両方にマッチするため）
    const helloElements = await canvas.findAllByText(/Hello/);
    await expect(helloElements.length).toBeGreaterThanOrEqual(1);

    const worldElements = await canvas.findAllByText(/World/);
    await expect(worldElements.length).toBeGreaterThanOrEqual(1);

    const japanElements = await canvas.findAllByText(/Japan/);
    await expect(japanElements.length).toBeGreaterThanOrEqual(1);
  },
};

export const EmptyInput: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 初期状態でプレースホルダーメッセージが表示される
    await expect(
      canvas.getByText('テキストを入力すると、差分がここに表示されます'),
    ).toBeInTheDocument();
  },
};
