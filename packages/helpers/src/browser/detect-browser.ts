export type BaselineBrowser =
  | 'chrome'
  | 'chrome_android'
  | 'edge'
  | 'firefox'
  | 'firefox_android'
  | 'safari'
  | 'safari_ios';

export type BaselineMinVersions = Partial<Record<BaselineBrowser, string>>;

export type DetectedBrowser = {
  browser: BaselineBrowser;
  version: string;
};

// Baseline のコア7ブラウザ。警告判定とサポート最低版の算出で共通の対象集合とする。
export const CORE_BROWSERS: readonly BaselineBrowser[] = [
  'chrome',
  'chrome_android',
  'edge',
  'firefox',
  'firefox_android',
  'safari',
  'safari_ios',
];

// ブラウザキー→表示名。main の警告モーダルと admin の一覧で共通利用する。
export const BROWSER_LABELS: Record<BaselineBrowser, string> = {
  chrome: 'Chrome',
  chrome_android: 'Chrome (Android)',
  edge: 'Edge',
  firefox: 'Firefox',
  firefox_android: 'Firefox (Android)',
  safari: 'Safari',
  safari_ios: 'Safari (iOS)',
};

// SamsungBrowser/Opera など Chromium/Gecko 派生ブラウザは Baseline のコア7ブラウザに
// 含まれないため、誤検出を避けて警告対象から外す。
const DOWNSTREAM_PATTERN =
  /SamsungBrowser|OPR\/|OPT\/|EdgA\/|UCBrowser|YaBrowser|Whale|QQBrowser|MiuiBrowser|HuaweiBrowser|Vivaldi|DuckDuckGo|Sleipnir|Silk/u;

const matchVersion = (ua: string, pattern: RegExp): string | null => {
  const matched = pattern.exec(ua);
  return matched?.[1] ?? null;
};

export const parseBrowserFromUserAgent = (
  ua: string,
): DetectedBrowser | null => {
  // iOS 上のブラウザは Chrome(CriOS)/Firefox(FxiOS)/Edge(EdgiOS) も含めすべて WebKit のため
  // safari_ios として扱う。バージョンは OS バージョン(Safari と一致)から取得する。
  if (/iPhone|iPad|iPod/u.test(ua)) {
    const osMatched = /OS (\d+)[_.](\d+)/u.exec(ua);
    if (osMatched) {
      return {
        browser: 'safari_ios',
        version: `${osMatched[1]}.${osMatched[2]}`,
      };
    }
    return null;
  }

  if (DOWNSTREAM_PATTERN.test(ua)) {
    return null;
  }

  const isAndroid = /Android/u.test(ua);

  const edgeVersion = matchVersion(ua, /Edg\/(\d+)/u);
  if (edgeVersion !== null) {
    return { browser: 'edge', version: edgeVersion };
  }

  const firefoxVersion = matchVersion(ua, /Firefox\/(\d+)/u);
  if (firefoxVersion !== null) {
    return {
      browser: isAndroid ? 'firefox_android' : 'firefox',
      version: firefoxVersion,
    };
  }

  const chromeVersion = matchVersion(ua, /Chrome\/(\d+)/u);
  if (chromeVersion !== null) {
    return {
      browser: isAndroid ? 'chrome_android' : 'chrome',
      version: chromeVersion,
    };
  }

  if (/Safari\//u.test(ua)) {
    const matched = /Version\/(\d+)\.(\d+)/u.exec(ua);
    if (matched) {
      return { browser: 'safari', version: `${matched[1]}.${matched[2]}` };
    }
  }

  return null;
};

if (import.meta.vitest) {
  describe('parseBrowserFromUserAgent', () => {
    describe('正常系', () => {
      it('Chrome デスクトップを検出する', () => {
        const ua =
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        expect(parseBrowserFromUserAgent(ua)).toEqual({
          browser: 'chrome',
          version: '120',
        });
      });

      it('Chrome Android を検出する', () => {
        const ua =
          'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
        expect(parseBrowserFromUserAgent(ua)).toEqual({
          browser: 'chrome_android',
          version: '120',
        });
      });

      it('Edge デスクトップを検出する', () => {
        const ua =
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
        expect(parseBrowserFromUserAgent(ua)).toEqual({
          browser: 'edge',
          version: '120',
        });
      });

      it('Firefox デスクトップを検出する', () => {
        const ua =
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0';
        expect(parseBrowserFromUserAgent(ua)).toEqual({
          browser: 'firefox',
          version: '121',
        });
      });

      it('Firefox Android を検出する', () => {
        const ua =
          'Mozilla/5.0 (Android 14; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0';
        expect(parseBrowserFromUserAgent(ua)).toEqual({
          browser: 'firefox_android',
          version: '121',
        });
      });

      it('Safari (macOS) を Version トークンから検出する', () => {
        const ua =
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15';
        expect(parseBrowserFromUserAgent(ua)).toEqual({
          browser: 'safari',
          version: '17.2',
        });
      });
    });

    describe('iOS は WebKit のため safari_ios に統一する', () => {
      it('iOS Safari を OS バージョンから検出する', () => {
        const ua =
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1';
        expect(parseBrowserFromUserAgent(ua)).toEqual({
          browser: 'safari_ios',
          version: '17.2',
        });
      });

      it('iOS Chrome (CriOS) も safari_ios として OS バージョンで検出する', () => {
        const ua =
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1';
        expect(parseBrowserFromUserAgent(ua)).toEqual({
          browser: 'safari_ios',
          version: '16.5',
        });
      });
    });

    describe('異常系・エッジケース', () => {
      it('SamsungBrowser はコア対象外として null を返す', () => {
        const ua =
          'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36';
        expect(parseBrowserFromUserAgent(ua)).toBeNull();
      });

      it('Opera (OPR) はコア対象外として null を返す', () => {
        const ua =
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0';
        expect(parseBrowserFromUserAgent(ua)).toBeNull();
      });

      it('Edge on Android (EdgA) はコア対象外として null を返す', () => {
        const ua =
          'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 EdgA/120.0.0.0';
        expect(parseBrowserFromUserAgent(ua)).toBeNull();
      });

      it('既知でない UA は null を返す', () => {
        const ua =
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; Trident/7.0; rv:11.0) like Gecko';
        expect(parseBrowserFromUserAgent(ua)).toBeNull();
      });
    });
  });
}
