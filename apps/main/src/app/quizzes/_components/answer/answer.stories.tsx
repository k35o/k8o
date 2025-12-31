import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, within } from 'storybook/test';
import { Answer } from '.';

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

export const SubmitAnswer: Story = {
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
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);

    // 解答フィールドに入力
    const answerField = canvas.getByRole('textbox', {
      name: 'What is the capital of Japan?',
    });
    await userEvent.type(answerField, 'Tokyo');

    // 入力値を確認
    await expect(answerField).toHaveValue('Tokyo');

    // 解答するボタンをクリック
    const submitButton = canvas.getByRole('button', { name: '解答する' });
    await userEvent.click(submitButton);

    // handleAnswerが呼ばれたことを確認
    await expect(args.handleAnswer).toHaveBeenCalledWith(true);
  },
};

export const ClickNextQuestion: Story = {
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
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);

    // 正解表示が出ていることを確認
    await expect(canvas.getByText('正解')).toBeInTheDocument();

    // 次の問題に進むボタンをクリック
    const nextButton = canvas.getByRole('button', { name: '次の問題に進む' });
    await userEvent.click(nextButton);

    // handleNextQuestionが呼ばれたことを確認
    await expect(args.handleNextQuestion).toHaveBeenCalled();
  },
};
