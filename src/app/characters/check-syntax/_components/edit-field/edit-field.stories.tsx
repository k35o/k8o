import type { Meta, StoryObj } from '@storybook/react';
import { EditField } from './edit-field';
import { CheckSyntaxProvider } from '../../_state/text';

const meta: Meta<typeof EditField> = {
  title: 'app/characters/check-syntax/edit-field',
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
