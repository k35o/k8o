import type { Spec } from '@json-render/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { selectVersion } from '../infrastructure/artifact-repository';
import {
  selectPublicVersion,
  updateSharedVersion,
  upsertShare,
} from '../infrastructure/artifact-share-repository';
import {
  changeSharedVersion,
  findPublicVersion,
  publishVersion,
} from './artifact-shares';
import { isShareSlug } from './share-slug';

vi.mock('server-only', () => ({}));
vi.mock('../infrastructure/artifact-repository', () => ({
  insertArtifactWithFirstVersion: vi.fn(),
  insertNextVersion: vi.fn(),
  selectArtifacts: vi.fn(),
  selectArtifactVersions: vi.fn(),
  selectVersion: vi.fn(),
}));
vi.mock('../infrastructure/artifact-share-repository', () => ({
  deleteShare: vi.fn(),
  selectPublicVersion: vi.fn(),
  selectSharedVersionId: vi.fn(),
  selectShareOfArtifact: vi.fn(),
  updateSharedVersion: vi.fn(),
  upsertShare: vi.fn(),
}));

const SPEC: Spec = {
  root: 'a',
  elements: { a: { type: 'Button', props: { label: 'OK' } } },
};

describe('publishVersion', () => {
  const input = { userId: 'u1', artifactId: 'a1b2c3d4e5f6', version: 2 };

  beforeEach(() => {
    vi.mocked(selectVersion).mockResolvedValue({
      id: 12,
      kind: 'ui',
      title: '問い合わせフォーム',
      summary: '入力欄2つと送信ボタンのフォームです。',
      content: { spec: SPEC },
    });
    vi.mocked(upsertShare).mockResolvedValue('AAAAAAAAAAAAAAAA');
  });

  describe('正常系', () => {
    it('持ち主の版なら、公開ページが見分ける形の slug を作り、その版の id と一緒に公開の行へ書く', async () => {
      await publishVersion(input);

      expect(selectVersion).toHaveBeenCalledExactlyOnceWith(input);
      expect(upsertShare).toHaveBeenCalledExactlyOnceWith({
        artifactId: 'a1b2c3d4e5f6',
        slug: expect.any(String),
        versionId: 12,
      });
      const slug = vi.mocked(upsertShare).mock.calls[0]?.[0].slug;
      expect(isShareSlug(slug ?? '')).toBe(true);
    });

    it('作った slug ではなく、公開の行に書かれた slug を返す', async () => {
      await expect(publishVersion(input)).resolves.toStrictEqual({
        slug: 'AAAAAAAAAAAAAAAA',
      });
    });

    it('公開するたびに、別の slug を作って渡す', async () => {
      await publishVersion(input);
      await publishVersion(input);

      const [first, second] = vi
        .mocked(upsertShare)
        .mock.calls.map(([share]) => share.slug);
      expect(first).not.toBe(second);
    });
  });

  describe('異常系', () => {
    it('持ち主の版でない（無い版を含む）なら、公開の行を書かずに null を返す', async () => {
      vi.mocked(selectVersion).mockResolvedValue(null);

      await expect(publishVersion(input)).resolves.toBeNull();
      expect(upsertShare).not.toHaveBeenCalled();
    });
  });
});

describe('changeSharedVersion', () => {
  const input = { userId: 'u1', artifactId: 'a1b2c3d4e5f6', version: 2 };

  beforeEach(() => {
    vi.mocked(selectVersion).mockResolvedValue({
      id: 12,
      kind: 'ui',
      title: '問い合わせフォーム',
      summary: '入力欄2つと送信ボタンのフォームです。',
      content: { spec: SPEC },
    });
  });

  describe('正常系', () => {
    it('公開中なら、持ち主の版の id で公開する版を変え、changed を返す', async () => {
      vi.mocked(updateSharedVersion).mockResolvedValue(true);

      await expect(changeSharedVersion(input)).resolves.toBe('changed');
      expect(selectVersion).toHaveBeenCalledExactlyOnceWith(input);
      expect(updateSharedVersion).toHaveBeenCalledExactlyOnceWith({
        artifactId: 'a1b2c3d4e5f6',
        versionId: 12,
      });
    });
  });

  describe('異常系', () => {
    it('公開の行が無ければ（取り消したあと）、公開し直さずに unshared を返す', async () => {
      vi.mocked(updateSharedVersion).mockResolvedValue(false);

      await expect(changeSharedVersion(input)).resolves.toBe('unshared');
      expect(upsertShare).not.toHaveBeenCalled();
    });

    it('持ち主の版でない（無い版を含む）なら、公開の行に触れずに failed を返す', async () => {
      vi.mocked(selectVersion).mockResolvedValue(null);

      await expect(changeSharedVersion(input)).resolves.toBe('failed');
      expect(updateSharedVersion).not.toHaveBeenCalled();
      expect(upsertShare).not.toHaveBeenCalled();
    });
  });
});

describe('findPublicVersion', () => {
  describe('正常系', () => {
    it('UI の版なら、タイトルと spec を返す', async () => {
      vi.mocked(selectPublicVersion).mockResolvedValue({
        kind: 'ui',
        title: '問い合わせフォーム',
        content: { spec: SPEC },
      });

      await expect(findPublicVersion(12)).resolves.toStrictEqual({
        kind: 'ui',
        title: '問い合わせフォーム',
        spec: SPEC,
      });
      expect(selectPublicVersion).toHaveBeenCalledExactlyOnceWith(12);
    });

    it('スライドの版なら、タイトルとデッキの source を返す', async () => {
      vi.mocked(selectPublicVersion).mockResolvedValue({
        kind: 'slides',
        title: 'LT の資料',
        content: { source: '## まとめ' },
      });

      await expect(findPublicVersion(12)).resolves.toStrictEqual({
        kind: 'slides',
        title: 'LT の資料',
        source: '## まとめ',
      });
    });
  });

  describe('異常系', () => {
    it('版が無ければ null を返す', async () => {
      vi.mocked(selectPublicVersion).mockResolvedValue(null);

      await expect(findPublicVersion(12)).resolves.toBeNull();
    });

    it('中身が生成物の種類に合わなければ null を返す', async () => {
      vi.mocked(selectPublicVersion).mockResolvedValue({
        kind: 'slides',
        title: 'LT の資料',
        content: { spec: SPEC },
      });

      await expect(findPublicVersion(12)).resolves.toBeNull();
    });
  });
});
