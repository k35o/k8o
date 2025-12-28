import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { CheckSyntaxProvider } from '../../_state/text';
import { EditField } from './edit-field';

const meta: Meta<typeof EditField> = {
  title: 'app/japanese-text-fixer/edit-field',
  component: EditField,
  decorators: [
    (Story) => (
      <CheckSyntaxProvider>
        <Story />
      </CheckSyntaxProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof EditField>;

export const Primary: Story = {};

export const InputText: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // テキストエリアにテキストを入力
    const textarea = canvas.getByRole('textbox', {
      name: '校正したいテキスト',
    });
    await userEvent.type(textarea, '満点の星空が見れる。');

    // 校正ボタンが有効になることを確認
    const submitButton = canvas.getByRole('button', { name: '校正する' });
    await expect(submitButton).not.toBeDisabled();
  },
};

export const EmptyState: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 空の状態では校正ボタンが無効
    const submitButton = canvas.getByRole('button', { name: '校正する' });
    await expect(submitButton).toBeDisabled();
  },
};
