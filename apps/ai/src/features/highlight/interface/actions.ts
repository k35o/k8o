'use server';

import {
  type HighlightedCode,
  highlightCode,
} from '@repo/code-highlight/tokenize';
import { headers } from 'next/headers';

import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

// 生成された TSX に shiki（'plastic' テーマ＝ブログ/OG と共通）でシンタックスハイライトを付ける。
// shiki はサーバ側だけで動かし、クライアントバンドルに載せない（重い）。トークン列を返し、
// クライアントは React として描画する（dangerouslySetInnerHTML を使わない）。
const MAX_CODE_LENGTH = 200_000;

export const highlightTsx = async (
  code: string,
): Promise<HighlightedCode | null> => {
  // オーナー専用ツールに合わせて action もゲートする（コストは無いが一貫性と濫用防止）。
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return null;
  }
  // 異常に長い入力での無駄な CPU を避ける。プレビュー TSX は十分小さい。
  if (code.length > MAX_CODE_LENGTH) {
    return null;
  }
  return highlightCode(code, 'tsx');
};
