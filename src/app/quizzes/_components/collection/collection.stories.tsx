import {
  CollectionByHighlight,
  CollectionByHighlightLoading,
} from '.';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof CollectionByHighlight> = {
  title: 'app/quizzes/collection',
  component: CollectionByHighlight,
};

export default meta;
type Story = StoryObj<typeof CollectionByHighlight>;

export const Default: Story = {
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
      {
        id: 4,
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
      {
        id: 5,
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
      {
        id: 6,
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
      {
        id: 7,
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
      {
        id: 8,
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
      {
        id: 9,
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

export const Loading: Story = {
  render: () => <CollectionByHighlightLoading />,
};
