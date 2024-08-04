import type { Meta, StoryObj } from '@storybook/react';
import { Answer } from '.';
import { fn } from '@storybook/test';
import { useState } from 'react';

const meta: Meta<typeof Answer> = {
  title: 'app/quizzes/answer',
  component: Answer,
  render: (args) => {
    const [answer, setAnswer] = useState('');
    return (
      <Answer {...args} answer={answer} handleChange={setAnswer} />
    );
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Answer>;

export const Default: Story = {
  args: {
    question: 'What is the capital of Japan?',
    highlight: null,
    handleAnswer: fn(),
  },
};

export const Highlight: Story = {
  args: {
    question: '次の漢字の読み方を答えよ',
    highlight: '醤',
    handleAnswer: fn(),
  },
};
