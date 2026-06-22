// 'plastic' テーマのコード面の色。shiki に依存しない純粋な定数なので、クライアント
// コンポーネントからも安全に import できる（'shiki' を引き込まない）。tokenize の
// フォールバックと、プレビュー側のプレーン表示が同じ供給源を参照するための単一ソース。
export const CODE_SURFACE = {
  bg: '#21252b',
  fg: '#a9b2c3',
} as const;
