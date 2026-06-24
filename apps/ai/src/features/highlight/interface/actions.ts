'use server';

import {
  type HighlightedCode,
  highlightCode,
} from '@repo/code-highlight/tokenize';
import { headers } from 'next/headers';

import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

// 生成 TSX に shiki でハイライトを付ける。shiki は重いのでサーバ側だけで動かし、トークン列を返してクライアントは React として描画する（dangerouslySetInnerHTML を使わない）。
const MAX_CODE_LENGTH = 200_000;

export const highlightTsx = async (
  code: string,
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
  return highlightCode(code, 'tsx');
};
