export const QUIZ_TYPE = {
  FISH_KANJI: 1,
} as const satisfies Record<string, number>;
export type QuizType = (typeof QUIZ_TYPE)[keyof typeof QUIZ_TYPE];
