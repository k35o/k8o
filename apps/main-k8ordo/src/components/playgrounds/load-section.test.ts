import { playgroundIds } from '@playgrounds/ids';
import { describe, expect, it } from 'vitest';

import { loadPlaygroundSection } from './load-section';

describe('loadPlaygroundSection', () => {
  describe('正常系', () => {
    it(
      'ids.ts のどの id でも、その id のセクションを読む',
      async () => {
        const sections = await Promise.all(
          playgroundIds.map(async (id) => loadPlaygroundSection(id)),
        );

        expect(sections.map((section) => section?.id)).toStrictEqual([
          ...playgroundIds,
        ]);
      },
      // 全部のデモと @k8ordo/ui を初めて変換するので、ほかの project と並ぶと既定の 5 秒を超えることがある
      30_000,
    );
  });

  describe('異常系', () => {
    it.each(['compare-sites-not-found', 'Media-Pseudos', 'ids', 'types'])(
      'セクションの無い id %s は undefined を返す',
      async (id) => {
        expect(await loadPlaygroundSection(id)).toBeUndefined();
      },
    );
  });
});
