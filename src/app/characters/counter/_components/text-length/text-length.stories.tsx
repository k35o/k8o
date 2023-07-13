import type { Meta, StoryObj } from '@storybook/react';
import { TextLength } from './text-length';

const meta: Meta<typeof TextLength> = {
  title: 'app/characters/counter/text-length',
  component: TextLength,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TextLength>;

export const Primary: Story = {};
