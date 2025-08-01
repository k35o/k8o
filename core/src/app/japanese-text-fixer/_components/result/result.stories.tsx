import { Result } from './result';
import { CheckSyntaxProvider } from '../../_state/text';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta: Meta<typeof Result> = {
  title: 'app/japanese-text-fixer/result',
  component: Result,
  decorators: [
    (Story) => (
      <CheckSyntaxProvider
        __test={{
          defaultFixTexts: { 0: '満点の星空が見られる' },
          defaultResultText: ['満点の星空が見れる。'],
        }}
      >
        <Story />
      </CheckSyntaxProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Result>;

export const Primary: Story = {};
