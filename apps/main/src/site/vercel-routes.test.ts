import { describe, expect, it } from 'vitest';

import { BEFORE_FILES, BEFORE_NOT_FOUND } from './vercel-routes';

const sources = [...BEFORE_FILES, ...BEFORE_NOT_FOUND].map(({ src }) => src);

describe('vercel() の規則', () => {
  describe('正常系', () => {
    it.each(sources)(
      '%s は、Vercel が当てるパスの全体を ^ から $ まで書く',
      (src) => {
        expect(src).toMatch(/^\^\/.*\$$/u);
      },
    );
  });
});
