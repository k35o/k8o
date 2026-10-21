import { getStaticToolName, isStaticToolUIPart } from 'ai';
import type { InferUITools, ToolUIPart } from 'ai';

import type { AgentUIMessage } from './agent-message';
import type { agentTools, WithholdsOutput } from './tools';

type AgentPart = AgentUIMessage['parts'][number];

type AgentToolPart = ToolUIPart<InferUITools<typeof agentTools>>;

type TextPart = Extract<AgentPart, { type: 'text' }>;

export const WITHHELD_OUTPUT_TEXT =
  'この出力は保存していません。中身が要るときは、同じ入力でもう一度呼んでください';

const isWithheldTool = (
  part: AgentPart,
  withholds: WithholdsOutput,
): part is AgentToolPart =>
  isStaticToolUIPart(part) &&
  // 型引数を省くと、絞り込んだ part から名前の型を推論できず string になる
  withholds[getStaticToolName<InferUITools<typeof agentTools>>(part)];

// provider が実行した tool の結果は、書き換えて送り返す道が無いので、結果の項目を落として呼び出しだけに
// 戻す。tool の名前ごとの input の型と type を TS が結び付けられないので、組み直した part は型を言い切る
const toCallOnly = (part: AgentToolPart): AgentPart => {
  switch (part.state) {
    case 'output-available': {
      const {
        output: _output,
        resultProviderMetadata: _resultProviderMetadata,
        preliminary: _preliminary,
        ...call
      } = part;
      return { ...call, state: 'input-available' } as AgentPart;
    }
    case 'output-error': {
      const {
        errorText: _errorText,
        resultProviderMetadata: _resultProviderMetadata,
        ...call
      } = part;
      return { ...call, state: 'input-available' } as AgentPart;
    }
    default:
      return part;
  }
};

const withheldPartOf = (
  part: AgentPart,
  withholds: WithholdsOutput,
): AgentPart | null => {
  if (!isWithheldTool(part, withholds)) {
    return null;
  }
  if (part.providerExecuted === true) {
    return part.state === 'input-available' ||
      part.state === 'output-available' ||
      part.state === 'output-error'
      ? toCallOnly(part)
      : null;
  }
  return part.state === 'output-available'
    ? ({ ...part, output: WITHHELD_OUTPUT_TEXT } as AgentPart)
    : null;
};

const withoutCitations = (part: TextPart): TextPart => {
  const anthropic = part.providerMetadata?.['anthropic'];
  if (anthropic?.['citations'] === undefined) {
    return part;
  }
  const { citations: _citations, ...rest } = anthropic;
  return {
    ...part,
    providerMetadata: { ...part.providerMetadata, anthropic: rest },
  };
};

// 置き換えた出力より後ろの thinking は原文に結び付いていて、送り返すと API に毎回落とされるので、
// 保存する前に外す。検索の引用は検索の結果より後ろの text にしか付かず、結果はどれも保存しないので、
// 引用はすべての text から外す
export const withholdToolOutputs = (
  message: AgentUIMessage,
  withholds: WithholdsOutput,
): AgentUIMessage => {
  const firstWithheld = message.parts.findIndex(
    (part) => withheldPartOf(part, withholds) !== null,
  );
  return {
    ...message,
    parts: message.parts.flatMap((part, index): AgentPart[] => {
      const withheld = withheldPartOf(part, withholds);
      if (withheld !== null) {
        return [withheld];
      }
      if (part.type === 'text') {
        return [withoutCitations(part)];
      }
      return firstWithheld !== -1 &&
        index > firstWithheld &&
        part.type === 'reasoning'
        ? []
        : [part];
    }),
  };
};
