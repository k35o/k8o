import type { GenerationMeta } from './parse-generation';

export type GenerationModel = 'fugu' | 'fugu-ultra';

export type FileVersion = {
  id: string;
  code: string;
  meta: GenerationMeta;
  createdAt: number;
  parentId: string | null;
};

export type GenerationState = {
  currentFile: string | null;
  versions: FileVersion[];
  activeVersionId: string | null;
  buildErrors: string | null;
  selectedModel: GenerationModel;
};

export type GenerationAction =
  | {
      type: 'generation-finished';
      id: string;
      code: string;
      meta: GenerationMeta;
      createdAt: number;
    }
  | {
      type: 'load-project';
      id: string;
      code: string;
      meta: GenerationMeta;
      createdAt: number;
    }
  | { type: 'reset' }
  | { type: 'restore-version'; versionId: string }
  | { type: 'undo' }
  | { type: 'build-failed'; errors: string }
  | { type: 'build-succeeded' }
  | { type: 'select-model'; model: GenerationModel };

export const initialGenerationState: GenerationState = {
  currentFile: null,
  versions: [],
  activeVersionId: null,
  buildErrors: null,
  selectedModel: 'fugu',
};

// 純粋な reducer（id / createdAt は呼び出し側から渡し、決定的・テスタブルに保つ）。
// 履歴は append-only。undo/restore は active を切り替えるだけで履歴を破壊しない。
export const generationReducer = (
  state: GenerationState,
  action: GenerationAction,
): GenerationState => {
  switch (action.type) {
    case 'generation-finished': {
      const version: FileVersion = {
        id: action.id,
        code: action.code,
        meta: action.meta,
        createdAt: action.createdAt,
        parentId: state.activeVersionId,
      };
      return {
        ...state,
        versions: [...state.versions, version],
        activeVersionId: version.id,
        currentFile: version.code,
        buildErrors: null,
      };
    }
    case 'load-project': {
      // 履歴から復元: 当該版を起点にストアを置き換える（セッション内 undo はここから始まる）。
      const version: FileVersion = {
        id: action.id,
        code: action.code,
        meta: action.meta,
        createdAt: action.createdAt,
        parentId: null,
      };
      return {
        ...initialGenerationState,
        selectedModel: state.selectedModel,
        versions: [version],
        activeVersionId: version.id,
        currentFile: version.code,
      };
    }
    case 'reset':
      return { ...initialGenerationState, selectedModel: state.selectedModel };
    case 'restore-version': {
      const target = state.versions.find(
        (version) => version.id === action.versionId,
      );
      if (target === undefined) {
        return state;
      }
      return { ...state, activeVersionId: target.id, currentFile: target.code };
    }
    case 'undo': {
      const active = state.versions.find(
        (version) => version.id === state.activeVersionId,
      );
      // active が無い（履歴外）か親が無い（先頭版）なら何もしない。
      const parentId = active?.parentId ?? null;
      if (parentId === null) {
        return state;
      }
      const parent = state.versions.find((version) => version.id === parentId);
      if (parent === undefined) {
        return state;
      }
      return { ...state, activeVersionId: parent.id, currentFile: parent.code };
    }
    case 'build-failed':
      return { ...state, buildErrors: action.errors };
    case 'build-succeeded':
      return { ...state, buildErrors: null };
    case 'select-model':
      return { ...state, selectedModel: action.model };
    default:
      return state;
  }
};
