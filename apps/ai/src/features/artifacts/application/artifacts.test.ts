import type { Spec } from '@json-render/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  insertArtifactWithFirstVersion,
  insertNextVersion,
  selectVersion,
} from '../infrastructure/artifact-repository';
import {
  findSlidesVersion,
  findUiVersion,
  saveSlidesVersion,
  saveUiVersion,
} from './artifacts';

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

describe('saveSlidesVersion', () => {
  const deck = '<Cover>\n# 発表\n</Cover>\n\n---\n\n## まとめ';
  const slides = {
    userId: 'u1',
    threadId: 'thread-1',
    title: 'LT の資料',
    instruction: '5枚のスライドにする',
    summary: '5枚のスライドにしました。',
    source: deck,
  };

  describe('正常系', () => {
    it('土台が無ければ、12文字の id を振った slides の生成物を、デッキの source を中身にして版 1 で作る', async () => {
      const saved = await saveSlidesVersion({ ...slides, base: null });

      expect(saved).toStrictEqual({
        artifactId: expect.stringMatching(/^[0-9a-f]{12}$/),
        version: 1,
      });
      expect(insertArtifactWithFirstVersion).toHaveBeenCalledExactlyOnceWith({
        id: saved.artifactId,
        userId: 'u1',
        kind: 'slides',
        threadId: 'thread-1',
        title: 'LT の資料',
        instruction: '5枚のスライドにする',
        summary: '5枚のスライドにしました。',
        content: { source: deck },
      });
    });

    it('土台があれば、その生成物に土台の版を親にした次の版を足し、その番号を返す', async () => {
      await expect(
        saveSlidesVersion({
          ...slides,
          base: { id: 12, artifactId: 'a1b2c3d4e5f6' },
        }),
      ).resolves.toStrictEqual({ artifactId: 'a1b2c3d4e5f6', version: 3 });
      expect(insertNextVersion).toHaveBeenCalledExactlyOnceWith({
        artifactId: 'a1b2c3d4e5f6',
        parentId: 12,
        threadId: 'thread-1',
        title: 'LT の資料',
        instruction: '5枚のスライドにする',
        summary: '5枚のスライドにしました。',
        content: { source: deck },
      });
    });
  });
});

describe('findSlidesVersion', () => {
  const query = { artifactId: 'a1b2c3d4e5f6', version: 2, userId: 'u1' };

  describe('正常系', () => {
    it('持ち主の slides の版を読み、その id・生成物・タイトル・source を返す', async () => {
      vi.mocked(selectVersion).mockResolvedValue({
        id: 12,
        title: 'LT の資料',
        content: { source: '## まとめ' },
      });

      await expect(findSlidesVersion(query)).resolves.toStrictEqual({
        id: 12,
        artifactId: 'a1b2c3d4e5f6',
        title: 'LT の資料',
        source: '## まとめ',
      });
      expect(selectVersion).toHaveBeenCalledExactlyOnceWith({
        artifactId: 'a1b2c3d4e5f6',
        version: 2,
        userId: 'u1',
        kind: 'slides',
      });
    });
  });

  describe('異常系', () => {
    it('版が見つからなければ null を返す', async () => {
      vi.mocked(selectVersion).mockResolvedValue(null);

      await expect(findSlidesVersion(query)).resolves.toBeNull();
    });

    it.each([
      ['中身が文字列', '## まとめ'],
      ['中身に source が無い', { spec: SPEC }],
      ['source が文字列でない', { source: ['## まとめ'] }],
      ['source が空', { source: '' }],
      ['source が空白だけ', { source: ' \n ' }],
    ])('%sなら null を返す', async (_label, content) => {
      vi.mocked(selectVersion).mockResolvedValue({
        id: 12,
        title: 'LT の資料',
        content,
      });

      await expect(findSlidesVersion(query)).resolves.toBeNull();
    });
  });
});
