import type { UIMessage } from 'ai';

import { toMeta } from './parse-meta';
import type { GenerationMeta } from './parse-meta';

export type { GenerationMeta } from './parse-meta';

export type ParsedGeneration = {
  code: string | null;
  meta: GenerationMeta | null;
  isComplete: boolean;
};

const TSX_FENCE = /```(?:tsx|jsx|typescript|ts)?\n([\s\S]*?)```/u;
const META_FENCE = /```json\n([\s\S]*?)```/u;
const TSX_OPEN = '```tsx';

// ストリーミング中・完了後の双方で使う。本文は TSX フェンス、meta は末尾 JSON フェンス。
export const parseGeneration = (raw: string): ParsedGeneration => {
  const codeMatch = TSX_FENCE.exec(raw);
  let code: string | null = codeMatch?.[1]?.trim() ?? null;

  // 開きフェンスのみで閉じ未到達（ストリーミング途中）→ 途中までをプレビュー用に拾う
  if (code === null) {
    const open = raw.indexOf(TSX_OPEN);
    if (open !== -1) {
      const partial = raw.slice(open + TSX_OPEN.length).replace(/^\n/u, '');
      code = partial.trim() === '' ? null : partial;
    }
  }

  let meta: GenerationMeta | null = null;
  const metaMatch = META_FENCE.exec(raw);
  if (metaMatch?.[1] !== undefined) {
    try {
      meta = toMeta(JSON.parse(metaMatch[1]));
    } catch {
      meta = null;
    }
  }

  return { code, meta, isComplete: codeMatch !== null && meta !== null };
};

export const messageText = (message: UIMessage): string => {
  let text = '';
  for (const part of message.parts) {
    if (part.type === 'text') {
      text += part.text;
    }
  }
  return text;
};
