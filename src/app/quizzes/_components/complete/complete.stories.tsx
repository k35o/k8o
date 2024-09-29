import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Complete } from '.';

const meta: Meta<typeof Complete> = {
  title: 'app/quizzes/complete',
  component: Complete,
  args: {
    reset: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Complete>;

export const Normal: Story = {
  args: {
    score: 75,
    maxCount: 100,
  },
};

export const Success: Story = {
  args: {
    score: 95,
    maxCount: 100,
  },
};

export const Warning: Story = {
  args: {
    score: 50,
    maxCount: 100,
  },
};

export const Error: Story = {
  args: {
    score: 25,
    maxCount: 100,
  },
};
