import type { Meta, StoryObj } from '@storybook/react';
import { Feedback } from '.';
import { fn } from '@storybook/test';

const meta: Meta<typeof Feedback> = {
  title: 'app/quizzes/feedback',
  component: Feedback,
};

export default meta;
type Story = StoryObj<typeof Feedback>;

export const IsCorrect: Story = {
  args: {
    question: '漢字の読み方を答えよ',
    highlight: '醤',
    answer: 'しょう',
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
    status: 'correct',
    handleNextQuestion: fn(),
  },
};

export const IsIncorrect: Story = {
  args: {
    question: '漢字の読み方を答えよ',
    highlight: '醤',
    answer: 'しょ',
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
    status: 'incorrect',
    handleNextQuestion: fn(),
  },
};

export const HasExplannation: Story = {
  args: {
    question: '漢字の読み方を答えよ',
    highlight: '醤',
    answer: 'しょ',
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
    status: 'incorrect',
    handleNextQuestion: fn(),
  },
};
