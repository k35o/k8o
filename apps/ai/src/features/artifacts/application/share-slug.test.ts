import { describe, expect, it } from 'vitest';

import { isShareSlug, newShareSlug } from './share-slug';

describe('newShareSlug', () => {
  describe('正常系', () => {
    it('作った slug は、公開ページが生成物の公開として見分ける形になる', () => {
      expect(isShareSlug(newShareSlug())).toBe(true);
    });
  });
});

describe('isShareSlug', () => {
  describe('異常系', () => {
    it('旧スタジオの公開の形（16 進 12 桁）は、生成物の公開としない', () => {
      expect(isShareSlug('0a1b2c3d4e5f')).toBe(false);
    });
  });
});
