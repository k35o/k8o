export type CoreBrowser =
  | 'chrome'
  | 'chrome_android'
  | 'edge'
  | 'firefox'
  | 'firefox_android'
  | 'safari'
  | 'safari_ios';

export type BrowserMinVersions = Partial<Record<CoreBrowser, string>>;

// 対応状況の集計と、サポート最低版の算出の対象にするコア7ブラウザ。
export const CORE_BROWSERS: readonly CoreBrowser[] = [
  'chrome',
  'chrome_android',
  'edge',
  'firefox',
  'firefox_android',
  'safari',
  'safari_ios',
];
