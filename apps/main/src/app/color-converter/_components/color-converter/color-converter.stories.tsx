import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { ColorConverter } from './color-converter';

const meta: Meta<typeof ColorConverter> = {
  title: 'app/color-converter/color-converter',
  component: ColorConverter,
};

export default meta;
type Story = StoryObj<typeof ColorConverter>;

export const Primary: Story = {};

export const ChangeHexColor: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // HEXフィールドをクリアして新しい値を入力
    const hexField = canvas.getByRole('textbox', { name: 'hex' });
    await userEvent.clear(hexField);
    await userEvent.type(hexField, 'ff0000');

    // RGBが更新されることを確認（spinbuttonの値は文字列）
    const redField = canvas.getByRole('spinbutton', { name: 'Red' });
    await expect(redField).toHaveValue('255');
  },
};

export const InitialState: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 初期状態の確認
    const hexField = canvas.getByRole('textbox', { name: 'hex' });
    await expect(hexField).toHaveValue('5eead4');

    // RGBフィールドが存在することを確認
    const redField = canvas.getByRole('spinbutton', { name: 'Red' });
    const greenField = canvas.getByRole('spinbutton', { name: 'Green' });
    const blueField = canvas.getByRole('spinbutton', { name: 'Blue' });

    await expect(redField).toBeInTheDocument();
    await expect(greenField).toBeInTheDocument();
    await expect(blueField).toBeInTheDocument();
  },
};
