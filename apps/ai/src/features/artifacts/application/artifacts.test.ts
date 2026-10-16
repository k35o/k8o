import type { Spec } from '@json-render/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  insertArtifactWithFirstVersion,
  insertNextVersion,
  selectArtifactVersions,
  selectVersion,
} from '../infrastructure/artifact-repository';
import {
  findSlidesVersion,
  findUiVersion,
  loadArtifact,
  saveSlidesVersion,
  saveUiVersion,
  versionFromParam,
} from './artifacts';

vi.mock('server-only', () => ({}));
vi.mock('../infrastructure/artifact-repository', () => ({
  insertArtifactWithFirstVersion: vi.fn(),
  insertNextVersion: vi.fn(),
  selectArtifacts: vi.fn(),
  selectArtifactVersions: vi.fn(),
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
    kind: 'ui',
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
      });
    });
  });

  describe('異常系', () => {
    it('版が見つからなければ null を返す', async () => {
      vi.mocked(selectVersion).mockResolvedValue(null);

      await expect(findUiVersion(query)).resolves.toBeNull();
    });

    it('slides の生成物の版なら null を返す', async () => {
      vi.mocked(selectVersion).mockResolvedValue({
        id: 12,
        kind: 'slides',
        title: 'LT の資料',
        content: { source: '## まとめ' },
      });

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
        kind: 'ui',
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
        kind: 'slides',
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
      });
    });
  });

  describe('異常系', () => {
    it('版が見つからなければ null を返す', async () => {
      vi.mocked(selectVersion).mockResolvedValue(null);

      await expect(findSlidesVersion(query)).resolves.toBeNull();
    });

    it('ui の生成物の版なら null を返す', async () => {
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
        kind: 'slides',
        title: 'LT の資料',
        content,
      });

      await expect(findSlidesVersion(query)).resolves.toBeNull();
    });
  });
});

describe('loadArtifact', () => {
  const historyRow = {
    kind: 'ui',
    title: '問い合わせフォーム',
    summary: 'ボタンを大きくしました。',
    threadId: 'thread-1',
  } as const;

  beforeEach(() => {
    vi.mocked(selectArtifactVersions).mockResolvedValue([
      {
        ...historyRow,
        version: 3,
        instruction: '最初の版に検索欄を足す',
        threadId: null,
        createdAt: '2026-10-15T14:00:00.000Z',
        parentArtifactId: 'a1b2c3d4e5f6',
        parentVersion: 1,
      },
      {
        ...historyRow,
        version: 2,
        instruction: 'ボタンを大きくする',
        createdAt: '2026-10-15T13:00:00.000Z',
        parentArtifactId: 'a1b2c3d4e5f6',
        parentVersion: 1,
      },
      {
        ...historyRow,
        version: 1,
        instruction: '問い合わせフォームを作る',
        createdAt: '2026-10-15T12:00:00.000Z',
        parentArtifactId: null,
        parentVersion: null,
      },
    ]);
  });

  describe('正常系', () => {
    it('全版の履歴に、土台の版から直した版か新しく作った版かを添え、選んだ版の中身と一緒に返す', async () => {
      await expect(
        loadArtifact({ artifactId: 'a1b2c3d4e5f6', version: 2, userId: 'u1' }),
      ).resolves.toStrictEqual({
        id: 'a1b2c3d4e5f6',
        kind: 'ui',
        versions: [
          {
            version: 3,
            title: '問い合わせフォーム',
            instruction: '最初の版に検索欄を足す',
            summary: 'ボタンを大きくしました。',
            threadId: null,
            createdAt: '2026-10-15T14:00:00.000Z',
            origin: { type: 'edit', version: 1 },
          },
          {
            version: 2,
            title: '問い合わせフォーム',
            instruction: 'ボタンを大きくする',
            summary: 'ボタンを大きくしました。',
            threadId: 'thread-1',
            createdAt: '2026-10-15T13:00:00.000Z',
            origin: { type: 'edit', version: 1 },
          },
          {
            version: 1,
            title: '問い合わせフォーム',
            instruction: '問い合わせフォームを作る',
            summary: 'ボタンを大きくしました。',
            threadId: 'thread-1',
            createdAt: '2026-10-15T12:00:00.000Z',
            origin: { type: 'new' },
          },
        ],
        selected: {
          version: 2,
          kind: 'ui',
          title: '問い合わせフォーム',
          spec: SPEC,
        },
      });
      expect(selectArtifactVersions).toHaveBeenCalledExactlyOnceWith({
        artifactId: 'a1b2c3d4e5f6',
        userId: 'u1',
      });
      expect(selectVersion).toHaveBeenCalledExactlyOnceWith({
        artifactId: 'a1b2c3d4e5f6',
        version: 2,
        userId: 'u1',
      });
    });

    it('版を選んでいなければ、いちばん新しい版を選ぶ', async () => {
      const loaded = await loadArtifact({
        artifactId: 'a1b2c3d4e5f6',
        version: null,
        userId: 'u1',
      });

      expect(loaded?.selected.version).toBe(3);
      expect(selectVersion).toHaveBeenCalledExactlyOnceWith({
        artifactId: 'a1b2c3d4e5f6',
        version: 3,
        userId: 'u1',
      });
    });

    it('スライドの版は、デッキの source を中身にして返す', async () => {
      const slidesRow = {
        kind: 'slides',
        title: 'LT の資料',
        threadId: 'thread-1',
      } as const;
      vi.mocked(selectArtifactVersions).mockResolvedValue([
        {
          ...slidesRow,
          version: 2,
          instruction: 'まとめを足す',
          summary: 'まとめのスライドを足しました。',
          createdAt: '2026-10-15T13:00:00.000Z',
          parentArtifactId: 'a1b2c3d4e5f6',
          parentVersion: 1,
        },
        {
          ...slidesRow,
          version: 1,
          instruction: 'LT の資料を作る',
          summary: '5枚の資料を作りました。',
          createdAt: '2026-10-15T12:00:00.000Z',
          parentArtifactId: null,
          parentVersion: null,
        },
      ]);
      vi.mocked(selectVersion).mockResolvedValue({
        id: 12,
        kind: 'slides',
        title: 'LT の資料',
        content: { source: '## まとめ' },
      });

      await expect(
        loadArtifact({ artifactId: 'a1b2c3d4e5f6', version: 2, userId: 'u1' }),
      ).resolves.toStrictEqual({
        id: 'a1b2c3d4e5f6',
        kind: 'slides',
        versions: [
          {
            version: 2,
            title: 'LT の資料',
            instruction: 'まとめを足す',
            summary: 'まとめのスライドを足しました。',
            threadId: 'thread-1',
            createdAt: '2026-10-15T13:00:00.000Z',
            origin: { type: 'edit', version: 1 },
          },
          {
            version: 1,
            title: 'LT の資料',
            instruction: 'LT の資料を作る',
            summary: '5枚の資料を作りました。',
            threadId: 'thread-1',
            createdAt: '2026-10-15T12:00:00.000Z',
            origin: { type: 'new' },
          },
        ],
        selected: {
          version: 2,
          kind: 'slides',
          title: 'LT の資料',
          source: '## まとめ',
        },
      });
    });
  });

  describe('異常系', () => {
    it('持ち主の生成物でなければ（履歴が空なら）、版を読まずに null を返す', async () => {
      vi.mocked(selectArtifactVersions).mockResolvedValue([]);

      await expect(
        loadArtifact({ artifactId: 'a1b2c3d4e5f6', version: 2, userId: 'u2' }),
      ).resolves.toBeNull();
      expect(selectVersion).not.toHaveBeenCalled();
    });

    it('選んだ版が無ければ null を返す', async () => {
      vi.mocked(selectVersion).mockResolvedValue(null);

      await expect(
        loadArtifact({ artifactId: 'a1b2c3d4e5f6', version: 9, userId: 'u1' }),
      ).resolves.toBeNull();
    });

    it('選んだ版の中身が壊れていれば null を返す', async () => {
      vi.mocked(selectVersion).mockResolvedValue({
        id: 12,
        kind: 'ui',
        title: '問い合わせフォーム',
        content: { source: '## まとめ' },
      });

      await expect(
        loadArtifact({ artifactId: 'a1b2c3d4e5f6', version: 2, userId: 'u1' }),
      ).resolves.toBeNull();
    });
  });
});

describe('versionFromParam', () => {
  describe('正常系', () => {
    it('値が無ければ、いちばん新しい版を指す null を返す', () => {
      expect(versionFromParam(undefined)).toBeNull();
    });

    it.each([
      ['1', 1],
      ['12', 12],
    ])('1以上の整数の %s は、その版の番号 %d にする', (value, version) => {
      expect(versionFromParam(value)).toBe(version);
    });
  });

  describe('異常系', () => {
    it.each([
      ['空の文字列', ''],
      ['0', '0'],
      ['負の数', '-1'],
      ['小数', '1.5'],
      ['先頭が0', '01'],
      ['数でない文字列', 'abc'],
      ['数のあとに文字が続く', '2a'],
      ['安全な整数を超える数', '9007199254740993'],
      ['同じ名前で2つ渡された値', ['1', '2']],
    ])('%sなら invalid を返す', (_label, value) => {
      expect(versionFromParam(value)).toBe('invalid');
    });
  });
});
