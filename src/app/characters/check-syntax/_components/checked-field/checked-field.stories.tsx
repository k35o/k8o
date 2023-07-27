import type { Meta, StoryObj } from '@storybook/react';
import { CheckedField } from './checked-field';
import { RecoilRoot } from 'recoil';
import { textState } from '../../_state/text';

const meta: Meta<typeof CheckedField> = {
  title: 'app/characters/check-syntax/checked-field',
  component: CheckedField,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CheckedField>;

export const Primary: Story = {
  render: () => (
    <RecoilRoot
      initializeState={(mutableSnapshot) => {
        mutableSnapshot.set(textState, 'これはテストです。');
      }}
    >
      <CheckedField />
    </RecoilRoot>
  ),
};
