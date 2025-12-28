import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { QrGenerator } from './qr-generator';

const meta: Meta<typeof QrGenerator> = {
  title: 'app/qr-generator/QrGenerator',
  component: QrGenerator,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof QrGenerator>;

export const Default: Story = {};

export const GenerateQrCode: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // テキストを入力
    const textField = canvas.getByRole('textbox', { name: 'テキスト' });
    await userEvent.type(textField, 'https://example.com');

    // QRコードが生成されることを確認（SVGが存在する）
    const qrContainer = canvasElement.querySelector('svg');
    await expect(qrContainer).toBeInTheDocument();

    // ダウンロードボタンが表示されることを確認
    const downloadButton = canvas.getByRole('button', {
      name: 'SVGをダウンロード',
    });
    await expect(downloadButton).toBeInTheDocument();
  },
};

export const EmptyInput: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 空の状態ではプレースホルダーメッセージが表示される
    await expect(
      canvas.getByText('QRコードを生成するにはテキストを入力してください'),
    ).toBeInTheDocument();
  },
};
