export const VIEW_OPTIONS = [
  { value: 'preview', label: 'プレビュー' },
  { value: 'source', label: 'ソース' },
] as const;

export const MOBILE_TAB_OPTIONS = [
  { value: 'chat', label: 'チャット' },
  ...VIEW_OPTIONS,
] as const;

export const NEW_PROJECT_EMPTY_STATE = {
  title: 'スライドを生成しましょう',
  hint: '例: 「TypeScript 入門の LT スライド」「自己紹介の5枚デッキ」',
  suggestions: [
    'TypeScript 入門の LT スライド',
    'モノレポ運用の勉強会資料',
    '自己紹介の5枚デッキ',
  ],
};
