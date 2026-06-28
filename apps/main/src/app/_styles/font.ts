import { M_PLUS_2 } from 'next/font/google';

const mPlus2 = M_PLUS_2({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-m-plus-2',
  // 'Yu Gothic UI' は 'Yu Gothic' より前に置く（後者は本文ウェイトが細りすぎる）
  fallback: [
    'Hiragino Sans',
    'Hiragino Kaku Gothic ProN',
    'Yu Gothic UI',
    'Yu Gothic',
    'Noto Sans CJK JP',
    'sans-serif',
  ],
});

export { mPlus2 };
