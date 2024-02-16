import type { Meta, StoryObj } from '@storybook/react';
import { RecoilRoot } from 'recoil';
import { textState } from '../../_state/text';
import { Result } from './result';

const meta: Meta<typeof Result> = {
  title: 'app/characters/check-syntax/result',
  component: Result,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Result>;

export const Primary: Story = {
  render: () => (
    <RecoilRoot
      initializeState={(mutableSnapshot) => {
        mutableSnapshot.set(textState, 'これはテストです。');
      }}
    >
      <Result />
    </RecoilRoot>
  ),
};
