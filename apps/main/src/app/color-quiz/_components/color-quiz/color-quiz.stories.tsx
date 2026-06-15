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
    const optionButtons = within(panel).getAllByRole('button', {
      name: /^Hexの選択肢:/u,
    });
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
    const optionButtons = within(panel).getAllByRole('button', {
      name: /^色の選択肢:/u,
    });
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
