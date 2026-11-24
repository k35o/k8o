import { resolve } from 'node:path';

// pnpm run は package の場所で script を動かすので、引数のパスは pnpm を呼んだ場所（INIT_CWD）から解く
export const fromInvocationDir = (path: string): string =>
  resolve(process.env['INIT_CWD'] ?? process.cwd(), path);
