import {
  generationReducer,
  type GenerationState,
  initialGenerationState,
} from './generation-store';
import type { GenerationMeta } from './parse-generation';

const meta: GenerationMeta = {
  title: 't',
  description: 'd',
  usedComponents: [],
  changes: [],
};

describe('generationReducer', () => {
  describe('正常系', () => {
    it('generation-finished で版を追加し active/currentFile を更新する', () => {
      const next = generationReducer(initialGenerationState, {
        type: 'generation-finished',
        id: 'v1',
        code: 'CODE1',
        meta,
        createdAt: 1,
      });
      expect(next.versions).toHaveLength(1);
      expect(next.activeVersionId).toBe('v1');
      expect(next.currentFile).toBe('CODE1');
      expect(next.buildErrors).toBeNull();
    });

    it('restore-version は履歴を変えず active/currentFile を切り替える', () => {
      const s1 = generationReducer(initialGenerationState, {
        type: 'generation-finished',
        id: 'v1',
        code: 'C1',
        meta,
        createdAt: 1,
      });
      const s2 = generationReducer(s1, {
        type: 'generation-finished',
        id: 'v2',
        code: 'C2',
        meta,
        createdAt: 2,
      });
      const restored = generationReducer(s2, {
        type: 'restore-version',
        versionId: 'v1',
      });
      expect(restored.versions).toHaveLength(2);
      expect(restored.activeVersionId).toBe('v1');
      expect(restored.currentFile).toBe('C1');
    });

    it('undo は親バージョンへ戻る', () => {
      const s1 = generationReducer(initialGenerationState, {
        type: 'generation-finished',
        id: 'v1',
        code: 'C1',
        meta,
        createdAt: 1,
      });
      const s2 = generationReducer(s1, {
        type: 'generation-finished',
        id: 'v2',
        code: 'C2',
        meta,
        createdAt: 2,
      });
      const undone = generationReducer(s2, { type: 'undo' });
      expect(undone.activeVersionId).toBe('v1');
      expect(undone.currentFile).toBe('C1');
    });

    it('load-project は当該版を起点にストアを置き換える', () => {
      const s1 = generationReducer(initialGenerationState, {
        type: 'generation-finished',
        id: 'v1',
        code: 'C1',
        meta,
        createdAt: 1,
      });
      const loaded = generationReducer(s1, {
        type: 'load-project',
        id: 'db-42',
        code: 'LOADED',
        meta,
        createdAt: 9,
      });
      expect(loaded.versions).toHaveLength(1);
      expect(loaded.versions[0]?.id).toBe('db-42');
      expect(loaded.activeVersionId).toBe('db-42');
      expect(loaded.currentFile).toBe('LOADED');
      expect(loaded.buildErrors).toBeNull();
    });

    it('reset は選択モデルを保ちつつ初期状態へ戻す', () => {
      const s1 = generationReducer(
        { ...initialGenerationState, selectedModel: 'fugu-ultra' },
        {
          type: 'generation-finished',
          id: 'v1',
          code: 'C1',
          meta,
          createdAt: 1,
        },
      );
      const reset = generationReducer(s1, { type: 'reset' });
      expect(reset.versions).toHaveLength(0);
      expect(reset.currentFile).toBeNull();
      expect(reset.activeVersionId).toBeNull();
      expect(reset.selectedModel).toBe('fugu-ultra');
    });
  });

  describe('異常系', () => {
    it('restore-version で未知 ID なら state を変えない', () => {
      const s1 = generationReducer(initialGenerationState, {
        type: 'generation-finished',
        id: 'v1',
        code: 'C1',
        meta,
        createdAt: 1,
      });
      const same = generationReducer(s1, {
        type: 'restore-version',
        versionId: 'unknown',
      });
      expect(same).toBe(s1);
    });
  });

  describe('エッジケース', () => {
    it('build-failed → build-succeeded で buildErrors が立って消える', () => {
      const failed = generationReducer(initialGenerationState, {
        type: 'build-failed',
        errors: 'boom',
      });
      expect(failed.buildErrors).toBe('boom');
      const ok = generationReducer(failed, { type: 'build-succeeded' });
      expect(ok.buildErrors).toBeNull();
    });

    it('親が無いバージョンで undo しても変わらない', () => {
      const s1 = generationReducer(initialGenerationState, {
        type: 'generation-finished',
        id: 'v1',
        code: 'C1',
        meta,
        createdAt: 1,
      });
      const undone = generationReducer(s1, { type: 'undo' });
      expect(undone.activeVersionId).toBe('v1');
    });

    it('active が履歴に存在しなくても undo は安全に no-op になる', () => {
      const broken: GenerationState = {
        ...initialGenerationState,
        activeVersionId: 'ghost',
      };
      const result = generationReducer(broken, { type: 'undo' });
      expect(result).toBe(broken);
    });
  });
});
