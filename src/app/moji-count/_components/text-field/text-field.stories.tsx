import type { Meta, StoryObj } from '@storybook/react';
import { TextField } from './text-field';

const meta: Meta<typeof TextField> = {
  title: 'app/moji-count/text-field',
  component: TextField,
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Primary: Story = {};
