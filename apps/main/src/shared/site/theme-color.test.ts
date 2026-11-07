import { describe, expect, it } from 'vitest';

import { THEME_COLOR } from './theme-color';

describe('THEME_COLOR', () => {
  describe('正常系', () => {
    it('明るいテーマは :root の、暗いテーマは .dark の bg-surface の色を、CSS の oklch() で返す', () => {
      expect(THEME_COLOR).toStrictEqual({
        light: 'oklch(0.975 0.001 235)',
        dark: 'oklch(0.18 0.001 235)',
      });
    });
  });
});
