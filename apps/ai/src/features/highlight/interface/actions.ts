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

export const highlightGenerated = async (
  code: string,
  lang: string,
  theme: 'light' | 'dark' = 'dark',
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
  return highlightCode(
    code,
    HIGHLIGHT_LANGS.has(lang) ? lang : 'text',
    // 引数はクライアントから改竄できるため、'light' 以外はすべて既定の暗色にする。
    theme === 'light' ? 'one-light' : 'plastic',
  );
};
