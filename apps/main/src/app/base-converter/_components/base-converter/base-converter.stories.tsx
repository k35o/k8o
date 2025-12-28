import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { BaseConverter } from './base-converter';

const meta: Meta<typeof BaseConverter> = {
  title: 'app/base-converter/base-converter',
  component: BaseConverter,
};

export default meta;
type Story = StoryObj<typeof BaseConverter>;

export const Primary: Story = {};

export const ConvertFromDecimal: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // 10進数のフィールドに入力
    const decimalField = canvas.getByRole('textbox', { name: '10進数' });
    await userEvent.type(decimalField, '255');

    // 他の基数に変換されることを確認
    const binaryField = canvas.getByRole('textbox', { name: '2進数' });
    const octalField = canvas.getByRole('textbox', { name: '8進数' });
    const hexField = canvas.getByRole('textbox', { name: '16進数' });

    await expect(binaryField).toHaveValue('11111111');
    await expect(octalField).toHaveValue('377');
    await expect(hexField).toHaveValue('ff');
  },
};

export const ConvertFromBinary: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // 2進数のフィールドに入力
    const binaryField = canvas.getByRole('textbox', { name: '2進数' });
    await userEvent.type(binaryField, '1010');

    // 他の基数に変換されることを確認
    const decimalField = canvas.getByRole('textbox', { name: '10進数' });
    const octalField = canvas.getByRole('textbox', { name: '8進数' });
    const hexField = canvas.getByRole('textbox', { name: '16進数' });

    await expect(decimalField).toHaveValue('10');
    await expect(octalField).toHaveValue('12');
    await expect(hexField).toHaveValue('a');
  },
};

export const InvalidBinaryInput: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // 2進数に無効な値を入力
    const binaryField = canvas.getByRole('textbox', { name: '2進数' });
    await userEvent.type(binaryField, '123');

    // エラーメッセージが表示されることを確認
    await expect(
      canvas.getByText('2進数は0または1で入力してください'),
    ).toBeInTheDocument();
  },
};
