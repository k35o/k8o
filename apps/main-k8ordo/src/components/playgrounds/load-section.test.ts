import { playgroundIds } from '@playgrounds/ids';
import { describe, expect, it } from 'vitest';

import { loadPlaygroundSection } from './load-section';

describe('loadPlaygroundSection', () => {
  describe('正常系', () => {
    it.each(playgroundIds)(
      'id %s のセクションを読む',
      async (id) => {
        expect((await loadPlaygroundSection(id))?.id).toBe(id);
      },
      // 最初に読む id は、デモと共有の部品（@k8ordo/ui など）を初めて変換するので、ほかの project と並ぶと既定の 5 秒を超えることがある
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
