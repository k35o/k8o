import { join } from 'node:path';
import { cwd } from 'node:process';

// ビルドの描画はバンドルした先で走り、import.meta.url が元のファイルの場所を指さないので、
// パッケージの直下から引く
export const CONTENT_DIR = join(cwd(), 'src/content');
