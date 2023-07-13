import type { Meta, StoryObj } from '@storybook/react';
import { CheckedField } from './checked-field';
import { EditField } from '../edit-field';

const meta: Meta<typeof CheckedField> = {
  title: 'app/characters/check-syntax/checked-field',
  component: CheckedField,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CheckedField>;

export const Primary: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-2">
      <EditField />
      <CheckedField />
    </div>
  ),
};
