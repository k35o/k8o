import type { Spec } from '@json-render/core';
import type { UISpec } from '@k8ordo/ui/json-render';

export type SpecProse = {
  title: string | null;
  description: string;
};

const TITLE_LINE = /^タイトル[:：]\s*(.+)$/u;

// 会話文パートの先頭のタイトル行（RESPONSE_RULES で強制）と説明文を分離する。
export const parseSpecProse = (text: string): SpecProse => {
  const trimmed = text.trim();
  const [first = '', ...rest] = trimmed.split('\n');
  const matched = TITLE_LINE.exec(first.trim());
  if (matched?.[1] !== undefined) {
    return { title: matched[1].trim(), description: rest.join('\n').trim() };
  }
  return { title: null, description: trimmed };
};

// UISpec の state は `... | undefined` を含み、exactOptionalPropertyTypes 下では
// そのまま Spec に代入できない。undefined の state キーを落として揃える。
export const toSpec = (spec: UISpec): Spec => {
  const { state, ...rest } = spec;
  return state === undefined ? rest : { ...rest, state };
};
