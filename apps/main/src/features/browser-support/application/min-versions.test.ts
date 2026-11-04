import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { renderBrowserslistrc } from '@repo/helpers/browser/browserslist';
import { describe, expect, it } from 'vitest';

import floorData from '../infrastructure/browser-min-versions.json';

const repoRoot = join(import.meta.dirname, '../../../../../..');

describe('.browserslistrc', () => {
  describe('正常系', () => {
    it('フロアの JSON から生成した内容と一致する', () => {
      expect(readFileSync(join(repoRoot, '.browserslistrc'), 'utf8')).toBe(
        renderBrowserslistrc(floorData.minVersions),
      );
    });
  });
});
