import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { ColorQuiz } from './color-quiz';

const meta: Meta<typeof ColorQuiz> = {
  title: 'app/color-quiz/color-quiz',
  component: ColorQuiz,
};

export default meta;
type Story = StoryObj<typeof ColorQuiz>;

export const Primary: Story = {};

export const ColorToHexMode: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 「色からHexを当てる」タブがデフォルトで選択されている
    const tab = canvas.getByRole('tab', {
      name: '色からHexを当てる',
    });
    await expect(tab).toHaveAttribute('aria-selected', 'true');

    // 回答ボタンが無効の状態で表示されている
    const submitButton = canvas.getByRole('button', {
      name: '回答する',
    });
    await expect(submitButton).toBeDisabled();
  },
};

export const ColorToHexSubmit: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // hex選択肢の最初をクリック（aria-labelで特定）
    const panel = canvas.getByRole('tabpanel');
    const optionButtons = within(panel).getAllByRole('button', {
      name: /^Hexの選択肢:/,
    });
    await expect(optionButtons.length).toBeGreaterThan(0);
    await userEvent.click(optionButtons[0] as HTMLElement);

    // 回答ボタンが有効になる
    const submitButton = canvas.getByRole('button', {
      name: '回答する',
    });
    await expect(submitButton).toBeEnabled();

    // 回答する
    await userEvent.click(submitButton);

    // 結果画面に「次の問題へ」ボタンが表示される
    await expect(
      canvas.getByRole('button', { name: '次の問題へ' }),
    ).toBeInTheDocument();
  },
};

export const HexToColorMode: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // 「Hexから色を当てる」タブに切り替え
    const tab = canvas.getByRole('tab', {
      name: 'Hexから色を当てる',
    });
    await userEvent.click(tab);

    await expect(tab).toHaveAttribute('aria-selected', 'true');

    // 回答ボタンが無効の状態で表示されている
    const submitButton = canvas.getByRole('button', {
      name: '回答する',
    });
    await expect(submitButton).toBeDisabled();
  },
};

export const HexToColorSubmit: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // 「Hexから色を当てる」タブに切り替え
    const tab = canvas.getByRole('tab', {
      name: 'Hexから色を当てる',
    });
    await userEvent.click(tab);

    // 色の選択肢をクリック（aria-labelで特定）
    const panel = canvas.getByRole('tabpanel');
    const optionButtons = within(panel).getAllByRole('button', {
      name: /^色の選択肢:/,
    });
    await expect(optionButtons.length).toBeGreaterThan(0);
    await userEvent.click(optionButtons[0] as HTMLElement);

    // 回答する
    const submitButton = canvas.getByRole('button', {
      name: '回答する',
    });
    await userEvent.click(submitButton);

    // 結果画面に「次の問題へ」ボタンが表示される
    await expect(
      canvas.getByRole('button', { name: '次の問題へ' }),
    ).toBeInTheDocument();
  },
};
