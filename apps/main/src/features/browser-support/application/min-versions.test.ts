import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

import {
  browserslistQueries,
  renderBrowserslistrc,
} from '@repo/helpers/browser/browserslist';
import { describe, expect, it } from 'vitest';

import floorData from '../infrastructure/browser-min-versions.json';

const require = createRequire(import.meta.url);
// Next.js が CSS / JS のターゲット決定に使うのは、自分が同梱する browserslist
// （caniuse-lite は node_modules から解決する）。同じものでクエリを解く
const browserslist = require('next/dist/compiled/browserslist') as (
  query: string,
) => string[];

const repoRoot = join(import.meta.dirname, '../../../../../..');

describe('.browserslistrc', () => {
  describe('正常系', () => {
    it('フロアの JSON から生成した内容と一致する', () => {
      expect(readFileSync(join(repoRoot, '.browserslistrc'), 'utf8')).toBe(
        renderBrowserslistrc(floorData.minVersions),
      );
    });

    // 解決できない版は Next が黙って既定のターゲット（Chrome 111 相当）に戻すため、
    // caniuse-lite が古いままフロアを上げると CSS の書き換えが復活する
    it.each(browserslistQueries(floorData.minVersions))(
      '%s を Next 同梱の browserslist が解決できる',
      (query) => {
        expect(browserslist(query)).not.toHaveLength(0);
      },
    );
  });
});
