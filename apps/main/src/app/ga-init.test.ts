import { readFileSync } from 'node:fs';
import { runInThisContext } from 'node:vm';

import { describe, expect, it } from 'vitest';

type GaWindow = {
  dataLayer?: unknown[];
  location: { href: string };
  navigation?: EventTarget;
};

type GaDocument = {
  currentScript: { dataset: Record<string, string> };
  title: string;
};

const source = readFileSync(
  new URL('../../public/ga-init.js', import.meta.url),
  'utf8',
);

// ブラウザでグローバルにある window と document を、同じ名前の引数で渡して流す
const runGaInit = runInThisContext(
  `(function (window, document) {\n${source}\n})`,
) as (window: GaWindow, document: GaDocument) => void;

const K8ORDO_SCRIPT = { gaId: 'G-TEST', countNavigations: '' };

const windowAt = (href: string, dataLayer?: unknown[]): GaWindow => ({
  ...(dataLayer === undefined ? {} : { dataLayer }),
  location: { href },
  navigation: new EventTarget(),
});

const documentWith = (
  dataset: Record<string, string>,
  title = 'k8o',
): GaDocument => ({ currentScript: { dataset }, title });

// router が URL を書き換え、新しいページを描いたあとで Navigation API が navigatesuccess を送る
const finishNavigation = (
  window: GaWindow,
  document: GaDocument,
  href: string,
  title: string,
): void => {
  window.location.href = href;
  document.title = title;
  window.navigation?.dispatchEvent(new Event('navigatesuccess'));
};

const commandsOf = (dataLayer: unknown[] | undefined): unknown[][] =>
  (dataLayer ?? []).map((command) => Array.from(command as ArrayLike<unknown>));

const pageViewsOf = (dataLayer: unknown[] | undefined): unknown[] =>
  commandsOf(dataLayer)
    .filter(([command, name]) => command === 'event' && name === 'page_view')
    .map(([, , params]) => params);

describe('ga-init.js', () => {
  describe('正常系', () => {
    it('script の data-ga-id の ID で計測を始めるコマンドを、dataLayer に積む', () => {
      const window = windowAt('https://k8o.me/');

      runGaInit(window, documentWith({ gaId: 'G-TEST' }));

      expect(commandsOf(window.dataLayer)).toStrictEqual([
        ['js', expect.any(Date)],
        ['config', 'G-TEST'],
      ]);
    });

    it('gtag.js が読めるよう、コマンドを arguments のオブジェクトで積む', () => {
      const window = windowAt('https://k8o.me/');

      runGaInit(window, documentWith({ gaId: 'G-TEST' }));

      expect(
        window.dataLayer?.map((command) =>
          Object.prototype.toString.call(command),
        ),
      ).toStrictEqual(['[object Arguments]', '[object Arguments]']);
    });

    it('ページの替わる遷移が終わると、遷移先の URL と題、遷移元の URL で page_view を積む', () => {
      const window = windowAt('https://k8o.me/');
      const document = documentWith(K8ORDO_SCRIPT);
      runGaInit(window, document);

      finishNavigation(window, document, 'https://k8o.me/blog', 'Blog | k8o');

      expect(pageViewsOf(window.dataLayer)).toStrictEqual([
        {
          page_location: 'https://k8o.me/blog',
          page_referrer: 'https://k8o.me/',
          page_title: 'Blog | k8o',
        },
      ]);
    });

    it('戻る・進むでページが替わったときも、遷移ごとに積む', () => {
      const window = windowAt('https://k8o.me/blog');
      const document = documentWith(K8ORDO_SCRIPT);
      runGaInit(window, document);

      finishNavigation(window, document, 'https://k8o.me/about', 'About | k8o');
      finishNavigation(window, document, 'https://k8o.me/blog', 'Blog | k8o');

      expect(pageViewsOf(window.dataLayer)).toStrictEqual([
        {
          page_location: 'https://k8o.me/about',
          page_referrer: 'https://k8o.me/blog',
          page_title: 'About | k8o',
        },
        {
          page_location: 'https://k8o.me/blog',
          page_referrer: 'https://k8o.me/about',
          page_title: 'Blog | k8o',
        },
      ]);
    });
  });

  describe('エッジケース', () => {
    it('読み込んだときは config が数えるので、page_view を積まない', () => {
      const window = windowAt('https://k8o.me/blog');

      runGaInit(window, documentWith(K8ORDO_SCRIPT));

      expect(pageViewsOf(window.dataLayer)).toStrictEqual([]);
    });

    it('パスが同じまま search や hash だけが替わった遷移は数えない', () => {
      const window = windowAt('https://k8o.me/blog');
      const document = documentWith(K8ORDO_SCRIPT);
      runGaInit(window, document);

      finishNavigation(
        window,
        document,
        'https://k8o.me/blog?q=css',
        'Blog | k8o',
      );
      finishNavigation(
        window,
        document,
        'https://k8o.me/blog?q=css#2024',
        'Blog | k8o',
      );

      expect(pageViewsOf(window.dataLayer)).toStrictEqual([]);
    });

    it('search が替わったあとに別のページへ移ると、替わったあとの URL を遷移元にする', () => {
      const window = windowAt('https://k8o.me/blog');
      const document = documentWith(K8ORDO_SCRIPT);
      runGaInit(window, document);

      finishNavigation(
        window,
        document,
        'https://k8o.me/blog?q=css',
        'Blog | k8o',
      );
      finishNavigation(window, document, 'https://k8o.me/about', 'About | k8o');

      expect(pageViewsOf(window.dataLayer)).toStrictEqual([
        {
          page_location: 'https://k8o.me/about',
          page_referrer: 'https://k8o.me/blog?q=css',
          page_title: 'About | k8o',
        },
      ]);
    });

    it('data-count-navigations の無い script（Next の main）は、遷移を数えない', () => {
      const window = windowAt('https://k8o.me/');
      const document = documentWith({ gaId: 'G-TEST' });
      runGaInit(window, document);

      finishNavigation(window, document, 'https://k8o.me/blog', 'Blog | k8o');

      expect(pageViewsOf(window.dataLayer)).toStrictEqual([]);
    });

    it('Navigation API の無いブラウザでも、計測を始めるコマンドまでは積む', () => {
      const window: GaWindow = { location: { href: 'https://k8o.me/' } };

      runGaInit(window, documentWith(K8ORDO_SCRIPT));

      expect(commandsOf(window.dataLayer)).toStrictEqual([
        ['js', expect.any(Date)],
        ['config', 'G-TEST'],
      ]);
    });

    it('gtag.js が先に読まれて dataLayer があっても、その配列の後ろに積む', () => {
      const queued = { event: 'gtm.js' };
      const dataLayer: unknown[] = [queued];
      const window = windowAt('https://k8o.me/', dataLayer);

      runGaInit(window, documentWith({ gaId: 'G-TEST' }));

      expect(window.dataLayer).toBe(dataLayer);
      expect(dataLayer[0]).toBe(queued);
      expect(commandsOf(dataLayer.slice(1))).toStrictEqual([
        ['js', expect.any(Date)],
        ['config', 'G-TEST'],
      ]);
    });
  });
});
