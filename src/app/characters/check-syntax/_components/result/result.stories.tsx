import type { Meta, StoryObj } from '@storybook/react';
import { CheckSyntaxProvider } from '../../_state/text';
import { Result } from './result';

const meta: Meta<typeof Result> = {
  title: 'app/characters/check-syntax/result',
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
