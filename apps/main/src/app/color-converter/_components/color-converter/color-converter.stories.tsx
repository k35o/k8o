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

    // RGBが更新されることを確認
    const redField = canvas.getByRole('spinbutton', { name: 'Red' });
    await expect(redField).toHaveValue(255);
  },
};

export const ChangeRgbColor: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // RGBフィールドを変更
    const redField = canvas.getByRole('spinbutton', { name: 'Red' });
    await userEvent.clear(redField);
    await userEvent.type(redField, '0');

    const greenField = canvas.getByRole('spinbutton', { name: 'Green' });
    await userEvent.clear(greenField);
    await userEvent.type(greenField, '255');

    const blueField = canvas.getByRole('spinbutton', { name: 'Blue' });
    await userEvent.clear(blueField);
    await userEvent.type(blueField, '0');

    // HEXが更新されることを確認
    const hexField = canvas.getByRole('textbox', { name: 'hex' });
    await expect(hexField).toHaveValue('00ff00');
  },
};
