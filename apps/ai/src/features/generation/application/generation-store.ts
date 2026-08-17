import type { GenerationModel } from './models';
import type { GenerationMeta } from './parse-meta';

// UI スタジオ（spec）とスライド（Markdown ソース）で content の型が違うため、
// 状態・アクション・レデューサはコンテンツ型でパラメタ化して共用する。
export type GenerationState<TContent> = {
  current: TContent | null;
  // 直近生成の meta（空状態でのタイトル表示に使う）。履歴/undo は持たない。
  lastMeta: GenerationMeta | null;
  // 生成結果が検証エラーだったとき、次ターンの system に流す修復指示。
  repairPrompt: string | null;
  selectedModel: GenerationModel;
};

export type GenerationAction<TContent> =
  | { type: 'generation-finished'; content: TContent; meta: GenerationMeta }
  | { type: 'load-project'; content: TContent; meta: GenerationMeta }
  | { type: 'reset' }
  | { type: 'repair-needed'; repairPrompt: string }
  | { type: 'select-model'; model: GenerationModel };

export const createInitialGenerationState = <
  TContent,
>(): GenerationState<TContent> => ({
  current: null,
  lastMeta: null,
  repairPrompt: null,
  selectedModel: 'fugu',
});

export const generationReducer = <TContent>(
  state: GenerationState<TContent>,
  action: GenerationAction<TContent>,
): GenerationState<TContent> => {
  switch (action.type) {
    case 'generation-finished':
      return {
        ...state,
        lastMeta: action.meta,
        current: action.content,
        repairPrompt: null,
      };
    case 'load-project':
      // 当該版を起点にストアを置き換える。
      return {
        ...createInitialGenerationState<TContent>(),
        selectedModel: state.selectedModel,
        lastMeta: action.meta,
        current: action.content,
      };
    case 'reset':
      return {
        ...createInitialGenerationState<TContent>(),
        selectedModel: state.selectedModel,
      };
    case 'repair-needed':
      return { ...state, repairPrompt: action.repairPrompt };
    case 'select-model':
      return { ...state, selectedModel: action.model };
    default:
      return state;
  }
};
