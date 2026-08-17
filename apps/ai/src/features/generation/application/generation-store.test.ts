import {
  createInitialGenerationState,
  generationReducer,
} from './generation-store';
import type { GenerationMeta } from './parse-meta';

const meta: GenerationMeta = {
  title: 't',
  description: 'd',
  usedComponents: [],
  changes: [],
};

const initial = createInitialGenerationState<string>();

describe('generationReducer', () => {
  describe('正常系', () => {
    it('generation-finished で lastMeta と current を更新する', () => {
      const next = generationReducer(initial, {
        type: 'generation-finished',
        content: 'CONTENT1',
        meta,
      });
      expect(next.lastMeta).toBe(meta);
      expect(next.current).toBe('CONTENT1');
      expect(next.repairPrompt).toBeNull();
    });

    it('generation-finished は最新の meta/content で上書きする', () => {
      const s1 = generationReducer(initial, {
        type: 'generation-finished',
        content: 'C1',
        meta,
      });
      const meta2: GenerationMeta = { ...meta, title: 't2' };
      const s2 = generationReducer(s1, {
        type: 'generation-finished',
        content: 'C2',
        meta: meta2,
      });
      expect(s2.lastMeta).toBe(meta2);
      expect(s2.current).toBe('C2');
    });

    it('load-project は当該版を起点にストアを置き換える', () => {
      const s1 = generationReducer(initial, {
        type: 'generation-finished',
        content: 'C1',
        meta,
      });
      const loaded = generationReducer(s1, {
        type: 'load-project',
        content: 'LOADED',
        meta,
      });
      expect(loaded.lastMeta).toBe(meta);
      expect(loaded.current).toBe('LOADED');
      expect(loaded.repairPrompt).toBeNull();
    });

    it('reset は選択モデルを保ちつつ初期状態へ戻す', () => {
      const s1 = generationReducer(
        { ...initial, selectedModel: 'fugu-ultra' },
        { type: 'generation-finished', content: 'C1', meta },
      );
      const reset = generationReducer(s1, { type: 'reset' });
      expect(reset.lastMeta).toBeNull();
      expect(reset.current).toBeNull();
      expect(reset.selectedModel).toBe('fugu-ultra');
    });

    it('select-model は選択モデルだけを更新する', () => {
      const next = generationReducer(initial, {
        type: 'select-model',
        model: 'fugu-ultra',
      });
      expect(next.selectedModel).toBe('fugu-ultra');
    });
  });

  describe('エッジケース', () => {
    it('repair-needed で repairPrompt が立ち、次の生成で消える', () => {
      const failed = generationReducer(initial, {
        type: 'repair-needed',
        repairPrompt: 'boom',
      });
      expect(failed.repairPrompt).toBe('boom');
      const ok = generationReducer(failed, {
        type: 'generation-finished',
        content: 'FIXED',
        meta,
      });
      expect(ok.repairPrompt).toBeNull();
    });
  });
});
