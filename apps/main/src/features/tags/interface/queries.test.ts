import { isNotFound } from '@k8ordo/framework';
import { getTags } from '@repo/api/build-data';
import { describe, expect, it, vi } from 'vitest';

import { getTag } from './queries';

vi.mock('@repo/api/build-data', () => ({ getTags: vi.fn() }));

const CSS = { id: 1, name: 'CSS', blogIds: [3], talkIds: [] };

describe('getTag', () => {
  describe('正常系', () => {
    it('タグの一覧から id で引いて返す', async () => {
      vi.mocked(getTags).mockResolvedValue([
        CSS,
        { id: 2, name: 'React', blogIds: [], talkIds: [4] },
      ]);

      await expect(getTag(1)).resolves.toStrictEqual(CSS);
    });
  });

  describe('異常系', () => {
    it('一覧に無い id は notFound() で 404 にする（paths に挙げた id ならビルドが止まる）', async () => {
      vi.mocked(getTags).mockResolvedValue([CSS]);

      await expect(getTag(999)).rejects.toSatisfy(isNotFound);
    });
  });
});
