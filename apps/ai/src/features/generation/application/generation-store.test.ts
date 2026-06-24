import { generationReducer, initialGenerationState } from './generation-store';
import type { GenerationMeta } from './parse-generation';

const meta: GenerationMeta = {
  title: 't',
  description: 'd',
  usedComponents: [],
  changes: [],
};

describe('generationReducer', () => {
  describe('正常系', () => {
    it('generation-finished で版を追加し currentFile を更新する', () => {
      const next = generationReducer(initialGenerationState, {
        type: 'generation-finished',
        code: 'CODE1',
        meta,
      });
      expect(next.versions).toHaveLength(1);
      expect(next.currentFile).toBe('CODE1');
      expect(next.buildErrors).toBeNull();
    });

    it('generation-finished は履歴に append する', () => {
      const s1 = generationReducer(initialGenerationState, {
        type: 'generation-finished',
        code: 'C1',
        meta,
      });
      const s2 = generationReducer(s1, {
        type: 'generation-finished',
        code: 'C2',
        meta,
      });
      expect(s2.versions).toHaveLength(2);
      expect(s2.currentFile).toBe('C2');
    });

    it('load-project は当該版を起点にストアを置き換える', () => {
      const s1 = generationReducer(initialGenerationState, {
        type: 'generation-finished',
        code: 'C1',
        meta,
      });
      const loaded = generationReducer(s1, {
        type: 'load-project',
        code: 'LOADED',
        meta,
      });
      expect(loaded.versions).toHaveLength(1);
      expect(loaded.currentFile).toBe('LOADED');
      expect(loaded.buildErrors).toBeNull();
    });

    it('reset は選択モデルを保ちつつ初期状態へ戻す', () => {
      const s1 = generationReducer(
        { ...initialGenerationState, selectedModel: 'fugu-ultra' },
        { type: 'generation-finished', code: 'C1', meta },
      );
      const reset = generationReducer(s1, { type: 'reset' });
      expect(reset.versions).toHaveLength(0);
      expect(reset.currentFile).toBeNull();
      expect(reset.selectedModel).toBe('fugu-ultra');
    });

    it('select-model は選択モデルだけを更新する', () => {
      const next = generationReducer(initialGenerationState, {
        type: 'select-model',
        model: 'fugu-ultra',
      });
      expect(next.selectedModel).toBe('fugu-ultra');
    });
  });

  describe('エッジケース', () => {
    it('build-failed で buildErrors が立ち、次の生成で消える', () => {
      const failed = generationReducer(initialGenerationState, {
        type: 'build-failed',
        errors: 'boom',
      });
      expect(failed.buildErrors).toBe('boom');
      const ok = generationReducer(failed, {
        type: 'generation-finished',
        code: 'FIXED',
        meta,
      });
      expect(ok.buildErrors).toBeNull();
    });
  });
});
