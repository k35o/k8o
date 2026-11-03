import { join } from 'node:path';
import { cwd } from 'node:process';

// 並走のあいだは記事とスライドを写さず、apps/main のものを読む。ビルドの描画はバンドルした
// 先で走り、import.meta.url が元のファイルの場所を指さないので、パッケージの直下から引く
export const CONTENT_DIR = join(cwd(), '../main/src/content');
