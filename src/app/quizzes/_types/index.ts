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
