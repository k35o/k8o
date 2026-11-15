import { createHash } from 'node:crypto';

// 記事の動く例の文書は script の中に </script を持たない（buildDemoDocument と束ねる処理が確かめる）
// ので、HTML を解かずに正規表現で切り出せる
const INLINE_SCRIPT = /<script\b[^>]*>([\s\S]*?)<\/script/giu;

export const inlineScriptHashes = (html: string): string[] =>
  [...html.matchAll(INLINE_SCRIPT)].map(
    ([, source = '']) =>
      `'sha256-${createHash('sha256')
        .update(source.replaceAll(/\r\n?/gu, '\n'))
        .digest('base64')}'`,
  );
