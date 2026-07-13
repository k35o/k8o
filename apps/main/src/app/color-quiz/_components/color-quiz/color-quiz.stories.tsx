import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { ColorQuiz } from './color-quiz';

const meta: Meta<typeof ColorQuiz> = {
  title: 'app/color-quiz/color-quiz',
  component: ColorQuiz,
  // コンポーネント自体がMath.random()で出題色を生成するため、VRTの対象外にする
  parameters: { vrt: { skip: true } },
};

export default meta;
type Story = StoryObj<typeof ColorQuiz>;

export const Primary: Story = {};

export const ColorToHexMode: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const tab = canvas.getByRole('tab', {
      name: '色からHexを当てる',
    });
    await expect(tab).toHaveAttribute('aria-selected', 'true');

    const submitButton = canvas.getByRole('button', {
      name: '回答する',
    });
    await expect(submitButton).toBeDisabled();
  },
};

export const ColorToHexSubmit: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    const panel = canvas.getByRole('tabpanel');
    const group = within(panel).getByRole('radiogroup', {
      name: 'Hexの選択肢',
    });
    const optionButtons = within(group).getAllByRole('radio');
    await expect(optionButtons.length).toBeGreaterThan(0);
    await userEvent.click(optionButtons[0] as HTMLElement);

    const submitButton = canvas.getByRole('button', {
      name: '回答する',
    });
    await expect(submitButton).toBeEnabled();

    await userEvent.click(submitButton);

    await expect(
      canvas.getByRole('button', { name: '次の問題へ' }),
    ).toBeInTheDocument();
  },
};

// 選択肢が radiogroup として矢印キーで選択移動できる（selection follows focus）
export const KeyboardSelectsOption: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const panel = canvas.getByRole('tabpanel');
    const group = within(panel).getByRole('radiogroup');
    const radios = within(group).getAllByRole('radio');
    const last = radios.length - 1;

    // 未選択時は先頭だけがタブ移動先（roving tabindex）
    await expect(radios[0]).toHaveAttribute('tabindex', '0');
    await expect(radios[1]).toHaveAttribute('tabindex', '-1');

    // 矢印キーで選択が focus に追従して移動し、tabindex も移る
    (radios[0] as HTMLElement).focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(radios[1]).toHaveAttribute('aria-checked', 'true');
    await expect(radios[1]).toHaveFocus();
    await expect(radios[1]).toHaveAttribute('tabindex', '0');
    await expect(radios[0]).toHaveAttribute('tabindex', '-1');

    // 先頭での ArrowLeft は末尾へ折り返す
    (radios[0] as HTMLElement).focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(radios[last]).toHaveAttribute('aria-checked', 'true');
    await expect(radios[last]).toHaveFocus();

    // Home / End で先頭・末尾へ移動する
    await userEvent.keyboard('{Home}');
    await expect(radios[0]).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{End}');
    await expect(radios[last]).toHaveAttribute('aria-checked', 'true');

    await expect(
      canvas.getByRole('button', { name: '回答する' }),
    ).toBeEnabled();
  },
};

export const HexToColorMode: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    const tab = canvas.getByRole('tab', {
      name: 'Hexから色を当てる',
    });
    await userEvent.click(tab);

    await expect(tab).toHaveAttribute('aria-selected', 'true');

    const submitButton = canvas.getByRole('button', {
      name: '回答する',
    });
    await expect(submitButton).toBeDisabled();
  },
};

export const HexToColorSubmit: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    const tab = canvas.getByRole('tab', {
      name: 'Hexから色を当てる',
    });
    await userEvent.click(tab);

    const panel = canvas.getByRole('tabpanel');
    const group = within(panel).getByRole('radiogroup', {
      name: '色の選択肢',
    });
    const optionButtons = within(group).getAllByRole('radio');
    await expect(optionButtons.length).toBeGreaterThan(0);
    await userEvent.click(optionButtons[0] as HTMLElement);

    const submitButton = canvas.getByRole('button', {
      name: '回答する',
    });
    await userEvent.click(submitButton);

    await expect(
      canvas.getByRole('button', { name: '次の問題へ' }),
    ).toBeInTheDocument();
  },
};
