import type { Spec } from '@json-render/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  findPublicVersion,
  findSharedVersionId,
} from '@/features/artifacts/application/artifact-shares';
import { getPublicProjectBySlug } from '@/features/projects/application/projects';

import { getPublicShareForRoute } from './queries';

vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));
vi.mock('@/features/artifacts/application/artifact-shares', () => ({
  findPublicVersion: vi.fn(),
  findSharedVersionId: vi.fn(),
}));
vi.mock('@/features/projects/application/projects', () => ({
  getProjectLatest: vi.fn(),
  getPublicProjectBySlug: vi.fn(),
  setVisibility: vi.fn(),
}));
vi.mock('@/features/highlight/application/highlight', () => ({
  highlightBlocks: vi.fn(),
}));

const spec: Spec = {
  root: 'a',
  elements: { a: { type: 'Button', props: { label: 'OK' } } },
};

beforeEach(() => {
  vi.mocked(findSharedVersionId).mockReset();
  vi.mocked(findPublicVersion).mockReset();
  vi.mocked(getPublicProjectBySlug).mockReset();
});

describe('getPublicShareForRoute', () => {
  describe('正常系', () => {
    it('生成物の公開の slug は、公開している版の id を引き、その版を返す。旧スタジオの公開は引かない', async () => {
      vi.mocked(findSharedVersionId).mockResolvedValue(12);
      vi.mocked(findPublicVersion).mockResolvedValue({
        kind: 'ui',
        title: '料金表',
        spec,
      });

      await expect(
        getPublicShareForRoute('Ab3-_xYz09KLmnOP'),
      ).resolves.toStrictEqual({ kind: 'ui', title: '料金表', spec });
      expect(findSharedVersionId).toHaveBeenCalledExactlyOnceWith(
        'Ab3-_xYz09KLmnOP',
      );
      expect(findPublicVersion).toHaveBeenCalledExactlyOnceWith(12);
      expect(getPublicProjectBySlug).not.toHaveBeenCalled();
    });

    it('旧スタジオの公開の slug は、旧スタジオの公開だけを引く', async () => {
      vi.mocked(getPublicProjectBySlug).mockResolvedValue({
        id: 1,
        title: '料金表',
        slug: '0a1b2c3d4e5f',
        spec,
        meta: {
          title: '料金表',
          description: '',
          usedComponents: [],
          changes: [],
        },
      });

      await expect(
        getPublicShareForRoute('0a1b2c3d4e5f'),
      ).resolves.toStrictEqual({ kind: 'ui', title: '料金表', spec });
      expect(findSharedVersionId).not.toHaveBeenCalled();
    });
  });

  describe('異常系', () => {
    it('公開していない生成物の slug は null を返し、版を引かない', async () => {
      vi.mocked(findSharedVersionId).mockResolvedValue(null);

      await expect(
        getPublicShareForRoute('Ab3-_xYz09KLmnOP'),
      ).resolves.toBeNull();
      expect(findPublicVersion).not.toHaveBeenCalled();
      expect(getPublicProjectBySlug).not.toHaveBeenCalled();
    });

    it('どちらの形でもない slug は、DB を引かずに null を返す', async () => {
      await expect(getPublicShareForRoute('not-a-slug')).resolves.toBeNull();
      expect(findSharedVersionId).not.toHaveBeenCalled();
      expect(getPublicProjectBySlug).not.toHaveBeenCalled();
    });
  });
});
