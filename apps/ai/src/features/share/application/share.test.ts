import type { Spec } from '@json-render/core';

import {
  getProjectLatest,
  getPublicProjectBySlug,
  setVisibility,
} from '@/features/projects/application/projects';

import { getPublicShare, publishProject, unpublishProject } from './share';

vi.mock('server-only', () => ({}));
vi.mock('@/features/projects/application/projects', () => ({
  getProjectLatest: vi.fn(),
  getPublicProjectBySlug: vi.fn(),
  setVisibility: vi.fn(),
}));

const spec: Spec = {
  root: 'a',
  elements: { a: { type: 'Button', props: { label: 'OK' } } },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('publishProject', () => {
  describe('正常系', () => {
    it('最新版を公開版として visibility を public にし、slug を返す', async () => {
      vi.mocked(getProjectLatest).mockResolvedValue({
        slug: 'abc123',
        versionId: 42,
      });
      vi.mocked(setVisibility).mockResolvedValue(true);

      const result = await publishProject({ userId: 'u1', projectId: 1 });

      expect(result).toStrictEqual({ slug: 'abc123' });
      expect(setVisibility).toHaveBeenCalledWith({
        userId: 'u1',
        projectId: 1,
        visibility: 'public',
        publishedVersionId: 42,
      });
    });
  });

  describe('異常系', () => {
    it('非所有/不存在（latest が null）は公開せず null', async () => {
      vi.mocked(getProjectLatest).mockResolvedValue(null);

      const result = await publishProject({ userId: 'u1', projectId: 1 });

      expect(result).toBeNull();
      expect(setVisibility).not.toHaveBeenCalled();
    });

    it('setVisibility が false（所有チェック落ち）なら null', async () => {
      vi.mocked(getProjectLatest).mockResolvedValue({
        slug: 'abc123',
        versionId: 42,
      });
      vi.mocked(setVisibility).mockResolvedValue(false);

      await expect(
        publishProject({ userId: 'u1', projectId: 1 }),
      ).resolves.toBeNull();
    });
  });
});

describe('unpublishProject', () => {
  describe('正常系', () => {
    it('visibility を private に戻し、公開版 ID をクリアして slug を返す', async () => {
      vi.mocked(getProjectLatest).mockResolvedValue({
        slug: 'abc123',
        versionId: 42,
      });
      vi.mocked(setVisibility).mockResolvedValue(true);

      await expect(
        unpublishProject({ userId: 'u1', projectId: 1 }),
      ).resolves.toStrictEqual({ slug: 'abc123' });
      expect(setVisibility).toHaveBeenCalledWith({
        userId: 'u1',
        projectId: 1,
        visibility: 'private',
        publishedVersionId: null,
      });
    });
  });

  describe('異常系', () => {
    it('プロジェクトが見つからなければ null を返し visibility を変更しない', async () => {
      vi.mocked(getProjectLatest).mockResolvedValue(null);

      await expect(
        unpublishProject({ userId: 'u1', projectId: 1 }),
      ).resolves.toBeNull();
      expect(setVisibility).not.toHaveBeenCalled();
    });

    it('setVisibility が false（所有チェック落ち）なら null を返す', async () => {
      vi.mocked(getProjectLatest).mockResolvedValue({
        slug: 'abc123',
        versionId: 42,
      });
      vi.mocked(setVisibility).mockResolvedValue(false);

      await expect(
        unpublishProject({ userId: 'u1', projectId: 1 }),
      ).resolves.toBeNull();
    });
  });
});

describe('getPublicShare', () => {
  describe('正常系', () => {
    it('公開プロジェクトを title / slug / spec に写して返す', async () => {
      vi.mocked(getPublicProjectBySlug).mockResolvedValue({
        id: 1,
        title: '料金表',
        slug: 'abc123',
        spec,
        meta: {
          title: '料金表',
          description: '',
          usedComponents: [],
          changes: [],
        },
      });

      await expect(getPublicShare('abc123')).resolves.toStrictEqual({
        title: '料金表',
        slug: 'abc123',
        spec,
      });
    });
  });

  describe('異常系', () => {
    it('非公開/不存在は null', async () => {
      vi.mocked(getPublicProjectBySlug).mockResolvedValue(null);

      await expect(getPublicShare('missing')).resolves.toBeNull();
    });
  });
});
