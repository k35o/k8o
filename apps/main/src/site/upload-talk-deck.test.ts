import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const script = fileURLToPath(
  new URL('../../scripts/upload-talk-deck.ts', import.meta.url),
);

describe('upload-talk-deck', () => {
  describe('異常系', () => {
    // 素の Node で読むので、読み込むファイルのどれかが @/ の別名を使うと、引数を見る前に落ちる
    it('引数が無いと、モジュールをすべて読み込んだうえで使い方を出して止まる', async () => {
      await expect(
        promisify(execFile)(process.execPath, [script]),
      ).rejects.toThrow(
        '使い方: pnpm run -F main upload:talk-deck <PDF> --slug <slug> [--notes <ファイル>] [--local]',
      );
    });
  });
});
