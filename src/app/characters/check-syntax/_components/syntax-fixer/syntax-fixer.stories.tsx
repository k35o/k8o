import type { Meta, StoryObj } from '@storybook/react';
import { SyntaxFixer } from './syntax-fixer';
import { RecoilRoot } from 'recoil';
import {
  resultMessagesState,
  resultTextState,
} from '../../_state/text';

const meta: Meta<typeof SyntaxFixer> = {
  title: 'app/characters/check-syntax/syntax-fixer',
  component: SyntaxFixer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SyntaxFixer>;

export const Primary: Story = {
  render: () => (
    <RecoilRoot
      initializeState={(mutableSnapshot) => {
        mutableSnapshot.set(resultTextState, ['これはテストです。']);
        mutableSnapshot.set(resultMessagesState, { 1: ['エラー'] });
      }}
    >
      <SyntaxFixer />
    </RecoilRoot>
  ),
};
