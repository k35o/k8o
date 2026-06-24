import type { GenerationModel } from './models';
import type { GenerationMeta } from './parse-generation';

export type FileVersion = {
  code: string;
  meta: GenerationMeta;
};

export type GenerationState = {
  currentFile: string | null;
  // セッション内の生成履歴（append-only）。今は空状態のタイトル表示に使う。
  versions: FileVersion[];
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
  versions: [],
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
        versions: [...state.versions, { code: action.code, meta: action.meta }],
        currentFile: action.code,
        buildErrors: null,
      };
    case 'load-project':
      // 当該版を起点にストアを置き換える。
      return {
        ...initialGenerationState,
        selectedModel: state.selectedModel,
        versions: [{ code: action.code, meta: action.meta }],
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
