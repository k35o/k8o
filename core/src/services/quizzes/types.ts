import { QUIZ_OPTIONS, QUIZ_TYPE } from './constants';

export type Quiz = {
  id: number;
  highlight: string | null;
  question: string;
  answers: {
    id: number;
    answer: string;
    explanation: string | null;
  }[];
};

export type QuizType = (typeof QUIZ_TYPE)[keyof typeof QUIZ_TYPE];

export type QuizKey = (typeof QUIZ_OPTIONS)[number]['key'];
