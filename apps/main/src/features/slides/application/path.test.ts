import { join } from 'node:path';
import { cwd } from 'node:process';

import { describe, expect, it } from 'vitest';

import { slidePath } from './path';

describe('slidePath', () => {
  describe('正常系', () => {
    it('slug から、apps/main にあるスライドの MDX ファイルのパスを生成する', () => {
      const result = slidePath('test-slug');

      expect(result).toBe(
        join(cwd(), '../main/src/content/slides/test-slug/content.mdx'),
      );
    });
  });
});
