import { readFileSync } from 'node:fs';
import { runInThisContext } from 'node:vm';

import { describe, expect, it } from 'vitest';

type GaWindow = { dataLayer?: unknown[] };

type GaDocument = { currentScript: { dataset: { gaId: string } } };

const source = readFileSync(
  new URL('../../public/ga-init.js', import.meta.url),
  'utf8',
);

// ブラウザでグローバルにある window と document を、同じ名前の引数で渡して流す
const runGaInit = runInThisContext(
  `(function (window, document) {\n${source}\n})`,
) as (window: GaWindow, document: GaDocument) => void;

const scriptWith = (gaId: string): GaDocument => ({
  currentScript: { dataset: { gaId } },
});

const commandsOf = (dataLayer: unknown[] | undefined): unknown[][] =>
  (dataLayer ?? []).map((command) => Array.from(command as ArrayLike<unknown>));

describe('ga-init.js', () => {
  describe('正常系', () => {
    it('script の data-ga-id の ID で計測を始めるコマンドを、dataLayer に積む', () => {
      const window: GaWindow = {};

      runGaInit(window, scriptWith('G-TEST'));

      expect(commandsOf(window.dataLayer)).toStrictEqual([
        ['js', expect.any(Date)],
        ['config', 'G-TEST'],
      ]);
    });

    it('gtag.js が読めるよう、コマンドを arguments のオブジェクトで積む', () => {
      const window: GaWindow = {};

      runGaInit(window, scriptWith('G-TEST'));

      expect(
        window.dataLayer?.map((command) =>
          Object.prototype.toString.call(command),
        ),
      ).toStrictEqual(['[object Arguments]', '[object Arguments]']);
    });
  });

  describe('エッジケース', () => {
    it('gtag.js が先に読まれて dataLayer があっても、その配列の後ろに積む', () => {
      const queued = { event: 'gtm.js' };
      const dataLayer: unknown[] = [queued];
      const window: GaWindow = { dataLayer };

      runGaInit(window, scriptWith('G-TEST'));

      expect(window.dataLayer).toBe(dataLayer);
      expect(dataLayer[0]).toBe(queued);
      expect(commandsOf(dataLayer.slice(1))).toStrictEqual([
        ['js', expect.any(Date)],
        ['config', 'G-TEST'],
      ]);
    });
  });
});
