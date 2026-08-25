'use server';

import { highlightCode } from '@repo/code-highlight/tokenize';
import type { HighlightedCode } from '@repo/code-highlight/tokenize';
import { headers } from 'next/headers';

import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

// 生成コードに shiki でハイライトを付ける。shiki は重いのでサーバ側だけで動かし、トークン列を返してクライアントは React として描画する（dangerouslySetInnerHTML を使わない）。
const MAX_CODE_LENGTH = 200_000;

// 許可する言語。生成物全体（tsx / markdown）に加え、スライド内のコードブロックで
// AI が使いがちな言語を挙げる。server action の引数はクライアントから改竄できるため、
// リスト外は text（無色）へフォールバックして shiki に未知の値を渡さない。
const HIGHLIGHT_LANGS = new Set([
  'bash',
  'css',
  'diff',
  'go',
  'html',
  'javascript',
  'js',
  'json',
  'jsx',
  'markdown',
  'md',
  'python',
  'rust',
  'sh',
  'shell',
  'sql',
  'text',
  'ts',
  'tsx',
  'typescript',
  'yaml',
]);

// デッキ内の全コードブロックを1回の往復で取得できるようバッチ形にしている
// （ブロック毎に呼ぶとセッション検証込みの POST が N 回走る）。単一コードの
// 呼び出し側も1要素の配列で同じ action を使う。
const MAX_BLOCKS = 100;

const isValidBlock = (
  block: unknown,
): block is { code: string; lang: string } =>
  typeof block === 'object' &&
  block !== null &&
  typeof (block as { code: unknown }).code === 'string' &&
  typeof (block as { lang: unknown }).lang === 'string';

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
  // 異常に長い入力での無駄な CPU を避ける。分割で迂回できないよう合計長で判定し、
  // 空文字ブロックの大量投入による増幅は要素数の上限で塞ぐ。
  const totalLength = blocks.reduce((sum, block) => sum + block.code.length, 0);
  if (blocks.length > MAX_BLOCKS || totalLength > MAX_CODE_LENGTH) {
    return blocks.map(() => null);
  }
  // 引数はクライアントから改竄できるため、'light' 以外はすべて既定の暗色にする。
  const resolvedTheme = theme === 'light' ? 'one-light' : 'plastic';
  return Promise.all(
    blocks.map((block) =>
      highlightCode(
        block.code,
        HIGHLIGHT_LANGS.has(block.lang) ? block.lang : 'text',
        resolvedTheme,
      ),
    ),
  );
};
