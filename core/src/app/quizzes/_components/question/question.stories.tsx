import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Question } from '.';

const meta: Meta<typeof Question> = {
  title: 'app/quizzes/question',
  component: Question,
};

export default meta;
type Story = StoryObj<typeof Question>;

export const IsCorrect: Story = {
  args: {
    quizzes: [
      {
        id: 1,
        question: '漢字の読み方を答えよ',
        highlight: '醤',
        answers: [
          {
            id: 1,
            answer: 'しょう',
            explanation: null,
          },
          {
            id: 2,
            answer: 'ひしお',
            explanation: null,
          },
          {
            id: 3,
            answer: 'ししびしお',
            explanation: null,
          },
        ],
      },
      {
        id: 2,
        question: '漢字の読み方を答えよ',
        highlight: '醤',
        answers: [
          {
            id: 4,
            answer: 'しょう',
            explanation: null,
          },
          {
            id: 5,
            answer: 'ひしお',
            explanation: null,
          },
          {
            id: 6,
            answer: 'ししびしお',
            explanation: null,
          },
        ],
      },
      {
        id: 3,
        question: '漢字の読み方を答えよ',
        highlight: '醤',
        answers: [
          {
            id: 7,
            answer: 'しょう',
            explanation: null,
          },
          {
            id: 8,
            answer: 'ひしお',
            explanation: null,
          },
          {
            id: 9,
            answer: 'ししびしお',
            explanation: null,
          },
        ],
      },
    ],
  },
};
