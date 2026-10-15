import type { BrowserMinVersions, CoreBrowser } from './detect-browser';
import { CORE_BROWSERS } from './detect-browser';

// browserslist のブラウザ名。モバイルは browserslist 側で別名になる
const BROWSERSLIST_NAMES: Record<CoreBrowser, string> = {
  chrome: 'chrome',
  chrome_android: 'and_chr',
  edge: 'edge',
  firefox: 'firefox',
  firefox_android: 'and_ff',
  safari: 'safari',
  safari_ios: 'ios_saf',
};

/** フロア（ブラウザ最低版）を browserslist のクエリにする。順序は CORE_BROWSERS */
export const browserslistQueries = (
  minVersions: BrowserMinVersions,
): string[] => {
  const queries: string[] = [];
  for (const browser of CORE_BROWSERS) {
    const version = minVersions[browser];
    if (version !== undefined) {
      queries.push(`${BROWSERSLIST_NAMES[browser]} >= ${version}`);
    }
  }
  return queries;
};

/** リポジトリ直下に置く .browserslistrc の中身 */
export const renderBrowserslistrc = (minVersions: BrowserMinVersions): string =>
  [
    '# generate:browser-min-versions が browser-min-versions.json と同じ版から生成する。手で編集しない。',
    '# Next.js (Lightning CSS / SWC) の変換ターゲットを、画面に出している対応ブラウザのフロアに合わせる。',
    ...browserslistQueries(minVersions),
    '',
  ].join('\n');

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;
  describe('browserslistQueries', () => {
    describe('正常系', () => {
      it('7 ブラウザを browserslist の名前で並べる', () => {
        expect(
          browserslistQueries({
            chrome: '153',
            chrome_android: '153',
            edge: '153',
            firefox: '155',
            firefox_android: '155',
            safari: '27',
            safari_ios: '27',
          }),
        ).toEqual([
          'chrome >= 153',
          'and_chr >= 153',
          'edge >= 153',
          'firefox >= 155',
          'and_ff >= 155',
          'safari >= 27',
          'ios_saf >= 27',
        ]);
      });
    });

    describe('エッジケース', () => {
      it('無いブラウザは出さない', () => {
        expect(browserslistQueries({ chrome: '153' })).toEqual([
          'chrome >= 153',
        ]);
      });
    });
  });

  describe('renderBrowserslistrc', () => {
    describe('正常系', () => {
      it('コメント 2 行のあとにクエリを 1 行ずつ置き、末尾を改行で終える', () => {
        const text = renderBrowserslistrc({ chrome: '153', safari: '27' });
        expect(text.split('\n')).toEqual([
          expect.stringMatching(/^# /u),
          expect.stringMatching(/^# /u),
          'chrome >= 153',
          'safari >= 27',
          '',
        ]);
      });
    });
  });
}
