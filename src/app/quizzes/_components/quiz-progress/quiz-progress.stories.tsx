import { QuizProgress } from '.';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof QuizProgress> = {
  title: 'app/quizzes/quiz-progress',
  component: QuizProgress,
};

export default meta;
type Story = StoryObj<typeof QuizProgress>;

export const Primary: Story = {
  args: {
    progress: 25,
    maxProgress: 100,
  },
};
