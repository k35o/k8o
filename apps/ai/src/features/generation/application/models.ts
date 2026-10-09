// 生成モデル ID の単一ソース。zod enum・store の型・provider の引数型がここから派生する
export const GENERATION_MODELS = [
  'claude-sonnet-5-5',
  'claude-opus-5-5',
] as const;

export type GenerationModel = (typeof GENERATION_MODELS)[number];

export const DEFAULT_GENERATION_MODEL: GenerationModel = 'claude-sonnet-5-5';

export const GENERATION_MODEL_LABELS: Record<GenerationModel, string> = {
  'claude-sonnet-5-5': 'Sonnet 5.5',
  'claude-opus-5-5': 'Opus 5.5',
};
