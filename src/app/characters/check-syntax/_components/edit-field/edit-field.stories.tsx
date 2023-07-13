import type { Meta, StoryObj } from '@storybook/react';
import { EditField } from './edit-field';

const meta: Meta<typeof EditField> = {
  title: 'app/characters/check-syntax/edit-field',
  component: EditField,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EditField>;

export const Primary: Story = {};
