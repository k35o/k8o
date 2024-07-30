import type { Meta, StoryObj } from '@storybook/react';
import { VerifiedSyntax } from './verified-syntax';
import { CheckSyntaxProvider } from '../../_state/text';

const meta: Meta<typeof VerifiedSyntax> = {
  title: 'app/characters/check-syntax/verified-syntax',
  component: VerifiedSyntax,
  decorators: [
    (Story) => (
      <CheckSyntaxProvider
        __test={{
          defaultText: '満点の星空が見られる。',
        }}
      >
        <Story />
      </CheckSyntaxProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof VerifiedSyntax>;

export const Primary: Story = {};
