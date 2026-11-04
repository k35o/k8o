// shiki に依存しない純粋な定数なので、クライアントコンポーネントからも安全に import できる。
export const CODE_SURFACE = {
  bg: '#21252b',
  fg: '#a9b2c3',
} as const;

// テーマの字の色には、コードを載せる面で 4.5:1 に届かないものがあるので、shiki の colorReplacements で差し替える。
// キーは shiki が引く小文字の色
export const COLOR_REPLACEMENTS = {
  'one-light': {
    '#a0a1a7': '#5a5a60',
    '#c18401': '#7b5200',
    '#a626a4': '#9d1a9c',
    '#4078f2': '#1e51c8',
    '#986801': '#7a5300',
    '#0184bc': '#00608b',
    '#e45649': '#b0201b',
    '#ca1243': '#b7003a',
    '#50a14f': '#0f6916',
    '#696c77': '#585a65',
  },
  plastic: {
    '#5f6672': '#939aa7',
    '#b57edc': '#ba83e1',
    '#e06c75': '#eb767e',
  },
} as const;
