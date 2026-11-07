import { playgroundIds } from '@playgrounds/ids';
import type { PlaygroundSection } from '@playgrounds/types';
import { beforeAll, describe, expect, it } from 'vitest';

import { loadPlaygroundSection } from './load-section';

describe('loadPlaygroundSection', () => {
  describe('正常系', () => {
    const sections = new Map<string, PlaygroundSection | undefined>();

    // 全部のデモと共有の部品（@k8ordo/ui など）を初めて変換するのに、CI でほかの project と並ぶと 30 秒を超える。その重さを id ごとの試験の時間切れから外すため、先にまとめて読む
    beforeAll(async () => {
      const loaded = await Promise.all(
        playgroundIds.map(
          async (id) => [id, await loadPlaygroundSection(id)] as const,
        ),
      );
      for (const [id, section] of loaded) sections.set(id, section);
    }, 120_000);

    it.each(playgroundIds)('id %s のセクションを読む', (id) => {
      expect(sections.get(id)?.id).toBe(id);
    });
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
