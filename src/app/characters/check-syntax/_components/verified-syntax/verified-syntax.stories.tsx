import type { Meta, StoryObj } from '@storybook/react';
import { VerifiedSyntax } from './verified-syntax';
import { RecoilRoot } from 'recoil';
import { textState } from '../../_state/text';

const meta: Meta<typeof VerifiedSyntax> = {
  title: 'app/characters/check-syntax/verified-syntax',
  component: VerifiedSyntax,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof VerifiedSyntax>;

export const Primary: Story = {
  render: () => (
    <RecoilRoot
      initializeState={(mutableSnapshot) => {
        mutableSnapshot.set(textState, 'これはテストです。');
      }}
    >
      <VerifiedSyntax />
    </RecoilRoot>
  ),
};
