'use server';

import type { HighlightedCode } from '@repo/code-highlight/tokenize';
import { headers } from 'next/headers';

import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

import { highlightBlocks } from '../application/highlight';

const isValidBlock = (
  block: unknown,
): block is { code: string; lang: string } =>
  typeof block === 'object' &&
  block !== null &&
  typeof (block as { code: unknown }).code === 'string' &&
  typeof (block as { lang: unknown }).lang === 'string';

// デッキ内の全コードブロックを1回の往復で取得できるようバッチ形にしている
// （ブロック毎に呼ぶとセッション検証込みの POST が N 回走る）。単一コードの
// 呼び出し側も1要素の配列で同じ action を使う。
export const highlightGenerated = async (
  blocks: Array<{ code: string; lang: string }>,
  theme: 'light' | 'dark' = 'dark',
): Promise<Array<HighlightedCode | null>> => {
  // 引数はクライアントから改竄できるため、blocks に触れる前に形を検査する
  // （null 要素や非配列で例外にせず、常に整った形で失敗する）。
  if (!Array.isArray(blocks) || !blocks.every((block) => isValidBlock(block))) {
    return [];
  }
  // オーナー専用ツールに合わせ濫用防止のため action もゲートする。
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return blocks.map(() => null);
  }
  // 引数はクライアントから改竄できるため、'light' 以外はすべて既定の暗色にする。
  return highlightBlocks(blocks, theme === 'light' ? 'light' : 'dark');
};
