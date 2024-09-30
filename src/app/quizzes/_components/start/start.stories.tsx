import type { Meta, StoryObj } from '@storybook/react';
import { Start } from './start';

const meta: Meta<typeof Start> = {
  title: 'app/quizzes/start',
  component: Start,
};

export default meta;
type Story = StoryObj<typeof Start>;

export const Primary: Story = {
  args: {},
};
