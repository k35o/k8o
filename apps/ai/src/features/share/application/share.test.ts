import type { Spec } from '@json-render/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { findPublicVersion } from '@/features/artifacts/application/artifact-shares';
import { highlightBlocks } from '@/features/highlight/application/highlight';
import {
  getProjectLatest,
  getPublicProjectBySlug,
  setVisibility,
} from '@/features/projects/application/projects';

import {
  getArtifactPublicShare,
  getLegacyPublicShare,
  publishProject,
  shareSlugKind,
  unpublishProject,
} from './share';

vi.mock('server-only', () => ({}));
vi.mock('@/features/projects/application/projects', () => ({
  getProjectLatest: vi.fn(),
  getPublicProjectBySlug: vi.fn(),
  setVisibility: vi.fn(),
}));
vi.mock('@/features/artifacts/application/artifact-shares', () => ({
  findPublicVersion: vi.fn(),
}));
vi.mock('@/features/highlight/application/highlight', () => ({
  highlightBlocks: vi.fn(),
}));

const spec: Spec = {
  root: 'a',
  elements: { a: { type: 'Button', props: { label: 'OK' } } },
};

const tokensOf = (content: string) => ({
  tokens: [[{ content, offset: 0 }]],
  fg: '#000000',
  bg: '#ffffff',
});

beforeEach(() => {
  vi.mocked(setVisibility).mockReset();
  vi.mocked(highlightBlocks).mockReset();
  vi.mocked(highlightBlocks).mockImplementation((blocks, theme) =>
    Promise.resolve(
      blocks.map((block) => tokensOf(`${theme}:${block.lang}:${block.code}`)),
    ),
  );
});

describe('shareSlugKind', () => {
  describe('正常系', () => {
    it('16 文字の base64url は生成物の公開とする', () => {
      expect(shareSlugKind('Ab3-_xYz09KLmnOP')).toBe('artifact');
    });

    it('16 進 12 桁は旧スタジオの公開とする', () => {
      expect(shareSlugKind('0a1b2c3d4e5f')).toBe('legacy');
    });
  });

  describe('異常系', () => {
    it.each([
      ['空文字', ''],
      ['15 文字', 'Ab3-_xYz09KLmnO'],
      ['17 文字', 'Ab3-_xYz09KLmnOPq'],
      ['base64url に無い文字を含む 16 文字', 'Ab3+/xYz09KLmnOP'],
      ['大文字を含む 12 桁', '0A1B2C3D4E5F'],
      ['16 進に無い文字を含む 12 桁', '0a1b2c3d4e5g'],
      ['パスのような値', '../../etc/passwd'],
    ])('%s は、どちらの公開でもないとする', (_, slug) => {
      expect(shareSlugKind(slug)).toBeNull();
    });
  });

  describe('エッジケース', () => {
    it('16 進だけの 16 文字は、長さで生成物の公開とする', () => {
      expect(shareSlugKind('0123456789abcdef')).toBe('artifact');
    });
  });
});

describe('getArtifactPublicShare', () => {
  describe('正常系', () => {
    it('UI はタイトルと spec だけを返す', async () => {
      vi.mocked(findPublicVersion).mockResolvedValue({
        kind: 'ui',
        title: '料金表',
        spec,
      });

      await expect(getArtifactPublicShare(12)).resolves.toStrictEqual({
        kind: 'ui',
        title: '料金表',
        spec,
      });
      expect(findPublicVersion).toHaveBeenCalledExactlyOnceWith(12);
    });

    it('スライドは発表者ノートを外し、コードブロックごとに2つのテーマのハイライトを添える', async () => {
      vi.mocked(findPublicVersion).mockResolvedValue({
        kind: 'slides',
        title: '発表',
        source: [
          '## 1枚目',
          '<Notes>',
          '聞き手に見せないメモ',
          '</Notes>',
          '---',
          '## 2枚目',
          '```ts',
          'const a = 1;',
          '```',
          '```bash',
          'echo hi',
          '```',
        ].join('\n'),
      });

      await expect(getArtifactPublicShare(12)).resolves.toStrictEqual({
        kind: 'slides',
        title: '発表',
        source: [
          '## 1枚目',
          '',
          '---',
          '## 2枚目',
          '```ts',
          'const a = 1;',
          '```',
          '```bash',
          'echo hi',
          '```',
        ].join('\n'),
        highlights: [
          {
            lang: 'ts',
            code: 'const a = 1;',
            light: tokensOf('light:ts:const a = 1;'),
            dark: tokensOf('dark:ts:const a = 1;'),
          },
          {
            lang: 'bash',
            code: 'echo hi',
            light: tokensOf('light:bash:echo hi'),
            dark: tokensOf('dark:bash:echo hi'),
          },
        ],
      });
    });
  });

  describe('異常系', () => {
    it('版が引けなければ null を返し、ハイライトしない', async () => {
      vi.mocked(findPublicVersion).mockResolvedValue(null);

      await expect(getArtifactPublicShare(12)).resolves.toBeNull();
      expect(highlightBlocks).not.toHaveBeenCalled();
    });

    it('ハイライトが上限で断られたブロックは、どちらのテーマも null にする', async () => {
      vi.mocked(findPublicVersion).mockResolvedValue({
        kind: 'slides',
        title: '発表',
        source: ['```ts', 'const a = 1;', '```'].join('\n'),
      });
      vi.mocked(highlightBlocks).mockImplementation((blocks) =>
        Promise.resolve(blocks.map(() => null)),
      );

      await expect(getArtifactPublicShare(12)).resolves.toMatchObject({
        highlights: [
          { lang: 'ts', code: 'const a = 1;', light: null, dark: null },
        ],
      });
    });
  });

  describe('エッジケース', () => {
    it('ノートに書いたコードブロックはハイライトしない', async () => {
      vi.mocked(findPublicVersion).mockResolvedValue({
        kind: 'slides',
        title: '発表',
        source: [
          '## 1枚目',
          '<Notes>',
          '```ts',
          'secret();',
          '```',
          '</Notes>',
        ].join('\n'),
      });

      await expect(getArtifactPublicShare(12)).resolves.toStrictEqual({
        kind: 'slides',
        title: '発表',
        source: '## 1枚目\n',
        highlights: [],
      });
    });
  });
});

describe('getLegacyPublicShare', () => {
  describe('正常系', () => {
    it('公開中の旧スタジオのプロジェクトを、UI のタイトルと spec だけにして返す', async () => {
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

      await expect(getLegacyPublicShare('0a1b2c3d4e5f')).resolves.toStrictEqual(
        { kind: 'ui', title: '料金表', spec },
      );
    });
  });

  describe('異常系', () => {
    it('非公開/不存在は null', async () => {
      vi.mocked(getPublicProjectBySlug).mockResolvedValue(null);

      await expect(getLegacyPublicShare('0a1b2c3d4e5f')).resolves.toBeNull();
    });
  });
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
