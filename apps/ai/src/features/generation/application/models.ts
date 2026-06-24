// 生成モデル ID の単一ソース。zod enum・store の型・provider の引数型がここから派生する
// （以前は3箇所に 'fugu' | 'fugu-ultra' を別々に書いていた）。
export const GENERATION_MODELS = ['fugu', 'fugu-ultra'] as const;

export type GenerationModel = (typeof GENERATION_MODELS)[number];
