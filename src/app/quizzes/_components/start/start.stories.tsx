import { Start } from './start';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof Start> = {
  title: 'app/quizzes/start',
  component: Start,
};

export default meta;
type Story = StoryObj<typeof Start>;

export const Primary: Story = {
  args: {},
};
