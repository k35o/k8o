import type { ColorSchemeScriptOptions } from '@k8ordo/color-scheme';

import { THEME_COLOR } from './theme-color.ts';

// ColorSchemeScript は渡した値を中身に持ち、<meta> の CSP はその中身のハッシュで script を許すので、
// routes/layout.tsx の ColorSchemeScript と vite.config.ts の colorSchemeScriptHash() にこの値を渡す
export const COLOR_SCHEME_SCRIPT_OPTIONS = {
  themeColor: THEME_COLOR,
} satisfies ColorSchemeScriptOptions;
