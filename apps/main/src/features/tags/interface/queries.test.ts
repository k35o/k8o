import { isNotFound } from '@k8ordo/framework';
import { describe, expect, it, vi } from 'vitest';

import { getTag as findTag } from '@/features/tags/application/tag';

import { getTag } from './queries';

vi.mock('@/features/tags/application/tag', () => ({
  getTag: vi.fn(),
}));
vi.mock('@/features/tags/application/tags', () => ({
  getTags: vi.fn(),
}));

describe('getTag', () => {
  describe('正常系', () => {
    it('タグがあればそのまま返す', async () => {
      const tag = { id: 1, name: 'CSS', blogs: [], talks: [] };
      vi.mocked(findTag).mockResolvedValue(tag);

      await expect(getTag(1)).resolves.toStrictEqual(tag);
    });
  });

  describe('異常系', () => {
    it('タグが無ければ notFound() で 404 にする（paths に挙げた id ならビルドが止まる）', async () => {
      vi.mocked(findTag).mockResolvedValue(null);

      await expect(getTag(999)).rejects.toSatisfy(isNotFound);
    });
  });
});
