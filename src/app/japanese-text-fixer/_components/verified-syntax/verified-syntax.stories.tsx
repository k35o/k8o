import { VerifiedSyntax } from './verified-syntax';
import { CheckSyntaxProvider } from '../../_state/text';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof VerifiedSyntax> = {
  title: 'app/japanese-text-fixer/verified-syntax',
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
};

export default meta;
type Story = StoryObj<typeof VerifiedSyntax>;

export const Primary: Story = {};
