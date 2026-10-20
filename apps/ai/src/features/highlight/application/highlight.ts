import 'server-only';
import { highlightCode } from '@repo/code-highlight/tokenize';
import type { HighlightedCode } from '@repo/code-highlight/tokenize';

type CodeBlock = { code: string; lang: string };

const MAX_CODE_LENGTH = 200_000;

const MAX_BLOCKS = 100;

// 言語はクライアントの引数や生成物の Markdown から来る任意の文字列なので、リスト外は text（無色）にして
// shiki に未知の値を渡さない。生成物全体（tsx / markdown）に加え、スライドのコードブロックで AI が使いがちな
// 言語を挙げる
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

const SHIKI_THEMES = {
  light: 'one-light',
  dark: 'plastic',
} as const;

// shiki は重いのでサーバーだけで動かし、トークン列を返してクライアントは React として描く（dangerouslySetInnerHTML を使わない）
export const highlightBlocks = async (
  blocks: CodeBlock[],
  theme: keyof typeof SHIKI_THEMES,
): Promise<Array<HighlightedCode | null>> => {
  // 分割で迂回できないよう合計の長さで断り、空のブロックを大量に並べる増幅はブロック数の上限で塞ぐ
  const totalLength = blocks.reduce((sum, block) => sum + block.code.length, 0);
  if (blocks.length > MAX_BLOCKS || totalLength > MAX_CODE_LENGTH) {
    return blocks.map(() => null);
  }
  return Promise.all(
    blocks.map((block) =>
      highlightCode(
        block.code,
        HIGHLIGHT_LANGS.has(block.lang) ? block.lang : 'text',
        SHIKI_THEMES[theme],
      ),
    ),
  );
};
