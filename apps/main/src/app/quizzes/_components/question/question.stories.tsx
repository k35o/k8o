import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
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

export const DisplaysProgress: Story = {
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
        ],
      },
      {
        id: 2,
        question: '漢字の読み方を答えよ',
        highlight: '味',
        answers: [
          {
            id: 2,
            answer: 'み',
            explanation: null,
          },
        ],
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // プログレス表示を確認（第1問）
    await expect(canvas.getByText('第1問')).toBeInTheDocument();
  },
};

export const AnswerCorrectly: Story = {
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
        ],
      },
      {
        id: 2,
        question: '次の問題',
        highlight: '味',
        answers: [
          {
            id: 2,
            answer: 'み',
            explanation: null,
          },
        ],
      },
    ],
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // 解答フィールドに正しい答えを入力
    const answerField = canvas.getByRole('textbox', {
      name: '漢字の読み方を答えよ',
    });
    await userEvent.type(answerField, 'しょう');

    // 解答するボタンをクリック
    const submitButton = canvas.getByRole('button', { name: '解答する' });
    await userEvent.click(submitButton);

    // 正解と表示されることを確認
    await expect(canvas.getByText('正解')).toBeInTheDocument();
  },
};

export const AnswerIncorrectly: Story = {
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
        ],
      },
    ],
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // 解答フィールドに間違った答えを入力
    const answerField = canvas.getByRole('textbox', {
      name: '漢字の読み方を答えよ',
    });
    await userEvent.type(answerField, 'まちがい');

    // 解答するボタンをクリック
    const submitButton = canvas.getByRole('button', { name: '解答する' });
    await userEvent.click(submitButton);

    // 不正解と表示されることを確認
    await expect(canvas.getByText('不正解')).toBeInTheDocument();
  },
};
