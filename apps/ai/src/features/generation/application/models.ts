// 生成モデル ID の単一ソース。zod enum・store の型・provider の引数型がここから派生する
export const GENERATION_MODELS = ['fugu', 'fugu-ultra'] as const;

export type GenerationModel = (typeof GENERATION_MODELS)[number];
