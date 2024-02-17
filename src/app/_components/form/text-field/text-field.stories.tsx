import type { Meta, StoryObj } from '@storybook/react';
import { TextField } from './text-field';

const meta: Meta<typeof TextField> = {
  title: 'components/form/text-field',
  component: TextField,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Primary: Story = {
  args: {
    value: '10',
    onChange: (value: string) => console.log(value),
  },
};
