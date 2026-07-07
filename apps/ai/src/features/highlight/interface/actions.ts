'use server';

import {
  type HighlightedCode,
  highlightCode,
} from '@repo/code-highlight/tokenize';
import { headers } from 'next/headers';

import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

// 生成コードに shiki でハイライトを付ける。shiki は重いのでサーバ側だけで動かし、トークン列を返してクライアントは React として描画する（dangerouslySetInnerHTML を使わない）。
const MAX_CODE_LENGTH = 200_000;

// 生成物の言語（ui-studio は TSX、slides は Markdown）。
const HIGHLIGHT_LANGS = ['tsx', 'markdown'] as const;

export type HighlightLang = (typeof HIGHLIGHT_LANGS)[number];

export const highlightGenerated = async (
  code: string,
  lang: HighlightLang,
): Promise<HighlightedCode | null> => {
  // オーナー専用ツールに合わせ濫用防止のため action もゲートする。
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return null;
  }
  // 異常に長い入力での無駄な CPU を避ける。
  if (code.length > MAX_CODE_LENGTH) {
    return null;
  }
  // server action の引数はクライアントから改竄できるため許可リストで検証する。
  if (!HIGHLIGHT_LANGS.includes(lang)) {
    return null;
  }
  return highlightCode(code, lang);
};
