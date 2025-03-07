import { Answer } from '.';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

const meta: Meta<typeof Answer> = {
  title: 'app/quizzes/answer',
  component: Answer,
};

export default meta;
type Story = StoryObj<typeof Answer>;

export const BeforeAnswer: Story = {
  args: {
    currentQuiz: {
      id: 1,
      highlight: '醤',
      question: '次の漢字の読み方を答えよ',
      answers: [
        {
          id: 1,
          answer: 'しょう',
          explanation:
            '「醤」は中国語では jiàng （チアン/ヂアン）と発音する。これに倣い中華料理の分野では日本語でも「ジャン」と読むことが多い。「醤」は3つに大別され、第一に最も古くからある動物性たんぱくの醤である醢（カイ）があり肉醤や魚醤が含まれる。第二は大豆や小麦など穀物を発酵させた醤である。第三は果醤（グオジャン、ジャム類）や番茄醤（ファンチェジャン、トマトケチャップ）、蛋黄醤（ダンホワンジャン、マヨネーズ）など必ずしも発酵しない粘稠性をもつ調味食品で、花生醤や芝麻醤などの調味食品やその加工品を含める',
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
    status: 'none',
    handleAnswer: fn(),
    handleNextQuestion: fn(),
  },
};

export const BeforeAnswerNoHighlight: Story = {
  args: {
    currentQuiz: {
      id: 2,
      highlight: null,
      question: 'What is the capital of Japan?',
      answers: [
        {
          id: 4,
          answer: 'Tokyo',
          explanation: null,
        },
      ],
    },
    status: 'none',
    handleAnswer: fn(),
    handleNextQuestion: fn(),
  },
};

export const AfterAnswerCorrect: Story = {
  args: {
    currentQuiz: {
      id: 1,
      highlight: '醤',
      question: '次の漢字の読み方を答えよ',
      answers: [
        {
          id: 1,
          answer: 'しょう',
          explanation:
            '「醤」は中国語では jiàng （チアン/ヂアン）と発音する。これに倣い中華料理の分野では日本語でも「ジャン」と読むことが多い。「醤」は3つに大別され、第一に最も古くからある動物性たんぱくの醤である醢（カイ）があり肉醤や魚醤が含まれる。第二は大豆や小麦など穀物を発酵させた醤である。第三は果醤（グオジャン、ジャム類）や番茄醤（ファンチェジャン、トマトケチャップ）、蛋黄醤（ダンホワンジャン、マヨネーズ）など必ずしも発酵しない粘稠性をもつ調味食品で、花生醤や芝麻醤などの調味食品やその加工品を含める',
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
    status: 'correct',
    handleAnswer: fn(),
    handleNextQuestion: fn(),
  },
};

export const AfterAnswerCorrectOnlyOneAnswer: Story = {
  args: {
    currentQuiz: {
      id: 2,
      highlight: null,
      question: 'What is the capital of Japan?',
      answers: [
        {
          id: 4,
          answer: 'Tokyo',
          explanation: null,
        },
      ],
    },
    status: 'correct',
    handleAnswer: fn(),
    handleNextQuestion: fn(),
  },
};

export const AfterAnswerIncorrect: Story = {
  args: {
    currentQuiz: {
      id: 2,
      highlight: null,
      question: 'What is the capital of Japan?',
      answers: [
        {
          id: 4,
          answer: 'Tokyo',
          explanation: null,
        },
      ],
    },
    status: 'incorrect',
    handleAnswer: fn(),
    handleNextQuestion: fn(),
  },
};
