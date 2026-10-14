export const VIEW_OPTIONS = [
  { value: 'preview', label: 'プレビュー' },
  { value: 'spec', label: 'spec' },
  { value: 'tsx', label: 'TSX' },
] as const;

export const MOBILE_TAB_OPTIONS = [
  { value: 'chat', label: 'チャット' },
  ...VIEW_OPTIONS,
] as const;

export const NEW_PROJECT_EMPTY_STATE = {
  title: 'UI を生成しましょう',
  hint: '例: 「お問い合わせフォームのカード」「料金プランの3カラム」',
  suggestions: [
    'お問い合わせフォームのカード',
    '料金プランの3カラム',
    'ヒーローセクション',
  ],
};
