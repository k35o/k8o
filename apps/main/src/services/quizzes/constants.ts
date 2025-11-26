export const QUIZ_OPTIONS = [
  {
    key: 'fish-kanji',
    label: 'うおへんクイズ',
  },
] as const satisfies { key: string; label: string }[];
export const QUIZ_TYPE = {
  FISH_KANJI: 1,
} as const satisfies Record<string, number>;
