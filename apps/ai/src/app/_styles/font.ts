import { M_PLUS_2, Noto_Sans_JP } from 'next/font/google';

const mPlus2 = M_PLUS_2({
  subsets: ['latin'],
  variable: '--font-m-plus-2',
});

const notoSansJp = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'optional',
  fallback: ['system-ui', 'sans-serif'],
});

export { mPlus2, notoSansJp };
