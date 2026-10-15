import type { Spec } from '@json-render/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  insertArtifactWithFirstVersion,
  insertNextVersion,
  selectVersion,
} from '../infrastructure/artifact-repository';
import { findUiVersion, saveUiVersion } from './artifacts';

vi.mock('server-only', () => ({}));
vi.mock('../infrastructure/artifact-repository', () => ({
  insertArtifactWithFirstVersion: vi.fn(),
  insertNextVersion: vi.fn(),
  selectVersion: vi.fn(),
}));

const SPEC: Spec = {
  root: 'a',
  elements: { a: { type: 'Button', props: { label: 'OK' } } },
};

const generated = {
  userId: 'u1',
  threadId: 'thread-1',
  title: '問い合わせフォーム',
  instruction: 'ボタンを大きくする',
  summary: 'ボタンを大きくしました。',
  spec: SPEC,
};

beforeEach(() => {
  vi.mocked(insertArtifactWithFirstVersion).mockResolvedValue();
  vi.mocked(insertNextVersion).mockResolvedValue(3);
  vi.mocked(selectVersion).mockResolvedValue({
    id: 12,
    title: '問い合わせフォーム',
    content: { spec: SPEC },
  });
});

describe('saveUiVersion', () => {
  describe('正常系', () => {
    it('土台が無ければ、12文字の id を振った ui の生成物を版 1 で作り、その id と版を返す', async () => {
      const saved = await saveUiVersion({ ...generated, base: null });

      expect(saved).toStrictEqual({
        artifactId: expect.stringMatching(/^[0-9a-f]{12}$/),
        version: 1,
      });
      expect(insertArtifactWithFirstVersion).toHaveBeenCalledExactlyOnceWith({
        id: saved.artifactId,
        userId: 'u1',
        kind: 'ui',
        threadId: 'thread-1',
        title: '問い合わせフォーム',
        instruction: 'ボタンを大きくする',
        summary: 'ボタンを大きくしました。',
        content: { spec: SPEC },
      });
      expect(insertNextVersion).not.toHaveBeenCalled();
    });

    it('土台があれば、その生成物に土台の版を親にした次の版を足し、その番号を返す', async () => {
      await expect(
        saveUiVersion({
          ...generated,
          base: { id: 12, artifactId: 'a1b2c3d4e5f6' },
        }),
      ).resolves.toStrictEqual({ artifactId: 'a1b2c3d4e5f6', version: 3 });
      expect(insertNextVersion).toHaveBeenCalledExactlyOnceWith({
        artifactId: 'a1b2c3d4e5f6',
        parentId: 12,
        threadId: 'thread-1',
        title: '問い合わせフォーム',
        instruction: 'ボタンを大きくする',
        summary: 'ボタンを大きくしました。',
        content: { spec: SPEC },
      });
      expect(insertArtifactWithFirstVersion).not.toHaveBeenCalled();
    });
  });
});

describe('findUiVersion', () => {
  const query = { artifactId: 'a1b2c3d4e5f6', version: 2, userId: 'u1' };

  describe('正常系', () => {
    it('持ち主の ui の版を読み、その id・生成物・タイトル・spec を返す', async () => {
      await expect(findUiVersion(query)).resolves.toStrictEqual({
        id: 12,
        artifactId: 'a1b2c3d4e5f6',
        title: '問い合わせフォーム',
        spec: SPEC,
      });
      expect(selectVersion).toHaveBeenCalledExactlyOnceWith({
        artifactId: 'a1b2c3d4e5f6',
        version: 2,
        userId: 'u1',
        kind: 'ui',
      });
    });
  });

  describe('異常系', () => {
    it('版が見つからなければ null を返す', async () => {
      vi.mocked(selectVersion).mockResolvedValue(null);

      await expect(findUiVersion(query)).resolves.toBeNull();
    });

    it.each([
      ['中身が文字列', 'spec'],
      ['中身に spec が無い', { code: '<Button />' }],
      ['spec の要素が空', { spec: { root: 'a', elements: {} } }],
      ['spec に root が無い', { spec: { elements: SPEC.elements } }],
    ])('%sなら null を返す', async (_label, content) => {
      vi.mocked(selectVersion).mockResolvedValue({
        id: 12,
        title: '問い合わせフォーム',
        content,
      });

      await expect(findUiVersion(query)).resolves.toBeNull();
    });
  });
});
