import { EditField } from './edit-field';
import { CheckSyntaxProvider } from '../../_state/text';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof EditField> = {
  title: 'app/japanese-text-fixer/edit-field',
  component: EditField,
  decorators: [
    (Story) => (
      <CheckSyntaxProvider>
        <Story />
      </CheckSyntaxProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof EditField>;

export const Primary: Story = {};
