import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { QuizBreadcrumb } from '.';

const meta: Meta<typeof QuizBreadcrumb> = {
  title: 'app/quizzes/quiz-breadcrumb',
  component: QuizBreadcrumb,
};

export default meta;
type Story = StoryObj<typeof QuizBreadcrumb>;

export const Primary: Story = {};
