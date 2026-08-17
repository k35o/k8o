import {
  SPEC_DATA_PART_TYPE,
  applySpecStreamPatch,
  isNonEmptySpec,
} from '@json-render/core';
import type { Spec, SpecDataPart } from '@json-render/core';
import type { ArteSpec } from '@k8o/arte-odyssey/json-render';
import type { UIMessage } from 'ai';

type SpecPart = {
  type: typeof SPEC_DATA_PART_TYPE;
  data: SpecDataPart;
};

const isSpecPart = (part: { type: string }): part is SpecPart =>
  part.type === SPEC_DATA_PART_TYPE;

// メッセージが spec パーツ（=UI 変更の意図）を含むか。specFromMessage が null の
// とき、「会話だけの応答」と「パッチが壊れて組み上がらなかった」を呼び出し側で
// 区別するために使う。
export const hasSpecParts = (message: UIMessage): boolean =>
  message.parts.some((part) => isSpecPart(part));

// assistant メッセージの data-spec パーツから spec を組み立てる。パッチは base
// （編集ターンでは生成開始時点の spec、新規では空）へ順に適用する。base を
// 直接書き換えないよう、適用はクローンに対して行う。
// spec パーツが無い（会話だけの応答）や、まだ root が届いていない生成途中は null。
export const specFromMessage = (
  message: UIMessage,
  base: Spec | null,
): Spec | null => {
  let working: Record<string, unknown> | null = null;
  for (const part of message.parts) {
    if (!isSpecPart(part)) {
      continue;
    }
    const { data } = part;
    if (data.type === 'patch') {
      working ??= structuredClone(base ?? {}) as Record<string, unknown>;
      try {
        applySpecStreamPatch(working, data.patch);
      } catch {
        // ストリーミング途中は前提パスが未到達でパッチが失敗しうる。その1件は
        // 落として続行し、検証は生成完了時の validateGeneratedSpec に任せる。
      }
    } else if (data.type === 'flat') {
      working = structuredClone(data.spec) as unknown as Record<
        string,
        unknown
      >;
    }
  }
  return working !== null && isNonEmptySpec(working) ? working : null;
};

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

// ArteSpec の state は `... | undefined` を含み、exactOptionalPropertyTypes 下では
// そのまま Spec に代入できない。undefined の state キーを落として揃える。
export const toSpec = (spec: ArteSpec): Spec => {
  const { state, ...rest } = spec;
  return state === undefined ? rest : { ...rest, state };
};

// spec が使っているコンポーネント種別（meta.usedComponents 用）。
export const usedComponentTypes = (spec: Spec): string[] => [
  ...new Set(Object.values(spec.elements).map((element) => element.type)),
];

export const countElements = (spec: Spec | null): number =>
  spec === null ? 0 : Object.keys(spec.elements).length;
