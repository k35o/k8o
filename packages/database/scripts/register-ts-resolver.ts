// src/schema/* は拡張子なしの相対 import を使うが、Node ネイティブの TS 実行は
// 拡張子を必須とする。build:erd の --import から読み込み、拡張子なしの相対指定を
// .ts に補完して解決する。

import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { fileURLToPath } from 'node:url';

registerHooks({
  resolve(specifier, context, nextResolve) {
    const isRelative =
      specifier.startsWith('./') || specifier.startsWith('../');
    const hasExt = /\.[mc]?[jt]s$/u.test(specifier);
    if (isRelative && !hasExt && context.parentURL !== undefined) {
      const candidate = new URL(`${specifier}.ts`, context.parentURL);
      if (existsSync(fileURLToPath(candidate))) {
        return nextResolve(candidate.href, context);
      }
    }
    return nextResolve(specifier, context);
  },
});
