import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { CheckSyntaxProvider } from '../../_state/text';
import { SyntaxFixer } from './syntax-fixer';

const meta: Meta<typeof SyntaxFixer> = {
  title: 'app/japanese-text-fixer/syntax-fixer',
  component: SyntaxFixer,
  decorators: [
    (Story) => (
      <CheckSyntaxProvider
        __test={{
          defaultResultText: [
            '満点の星空が見れる。',
            'すもももももももものうち',
          ],
          defaultResultMessages: {
            1: ['ら抜き言葉を使用しています。'],
            2: [
              '一文に二回以上利用されている助詞 "も" がみつかりました。 次の助詞が連続しているため、文を読みにくくしています。 - すもも"も" - もも"も" 同じ助詞を連続して利用しない、文の中で順番を入れ替える、文を分割するなどを検討してください。',
            ],
          },
        }}
      >
        <Story />
      </CheckSyntaxProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SyntaxFixer>;

export const Primary: Story = {};

export const NavigateSteps: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // 初期状態: 1/2
    await expect(canvas.getByText(/1\/2/)).toBeInTheDocument();

    // 次へボタンをクリック（IconButtonなのでlabelで探す）
    const buttons = canvas.getAllByRole('button');
    // 「次へ」ボタンは最後のIconButton
    const nextButton = buttons.find((btn) =>
      btn.getAttribute('aria-label')?.includes('次へ'),
    );
    if (nextButton) {
      await userEvent.click(nextButton);
      // 2/2 になることを確認
      await expect(canvas.getByText(/2\/2/)).toBeInTheDocument();
    }
  },
};

export const EditFixText: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // 修正後のテキストフィールドを確認
    const textarea = canvas.getByRole('textbox', { name: '修正後のテキスト' });
    await expect(textarea).toBeInTheDocument();

    // テキストを編集
    await userEvent.clear(textarea);
    await userEvent.type(textarea, '満点の星空が見られる。');

    await expect(textarea).toHaveValue('満点の星空が見られる。');
  },
};
