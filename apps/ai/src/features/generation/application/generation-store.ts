import type { GenerationModel } from './models';
import type { GenerationMeta } from './parse-generation';

export type GenerationState = {
  currentFile: string | null;
  // 直近生成の meta（空状態でのタイトル表示に使う）。履歴/undo は持たない。
  lastMeta: GenerationMeta | null;
  buildErrors: string | null;
  selectedModel: GenerationModel;
};

export type GenerationAction =
  | { type: 'generation-finished'; code: string; meta: GenerationMeta }
  | { type: 'load-project'; code: string; meta: GenerationMeta }
  | { type: 'reset' }
  | { type: 'build-failed'; errors: string }
  | { type: 'select-model'; model: GenerationModel };

export const initialGenerationState: GenerationState = {
  currentFile: null,
  lastMeta: null,
  buildErrors: null,
  selectedModel: 'fugu',
};

export const generationReducer = (
  state: GenerationState,
  action: GenerationAction,
): GenerationState => {
  switch (action.type) {
    case 'generation-finished':
      return {
        ...state,
        lastMeta: action.meta,
        currentFile: action.code,
        buildErrors: null,
      };
    case 'load-project':
      // 当該版を起点にストアを置き換える。
      return {
        ...initialGenerationState,
        selectedModel: state.selectedModel,
        lastMeta: action.meta,
        currentFile: action.code,
      };
    case 'reset':
      return { ...initialGenerationState, selectedModel: state.selectedModel };
    case 'build-failed':
      return { ...state, buildErrors: action.errors };
    case 'select-model':
      return { ...state, selectedModel: action.model };
    default:
      return state;
  }
};
