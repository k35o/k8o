import type { Meta, StoryObj } from '@storybook/react';
import { SyntaxFixer } from './syntax-fixer';
import { CheckSyntaxProvider } from '../../_state/text';

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
