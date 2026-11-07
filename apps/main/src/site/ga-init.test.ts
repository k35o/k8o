import { readFileSync } from 'node:fs';
import { runInThisContext } from 'node:vm';

import { describe, expect, it } from 'vitest';

const GTAG_URL = 'https://www.googletagmanager.com/gtag/js?id=G-TEST';

// ga-init.js が使う cloneNode と removeAttribute だけを持つ要素。src への代入は Trusted Types の sink なので数える
class FakeElement {
  readonly srcAssignments: string[] = [];

  constructor(
    readonly tagName: string,
    readonly attributes: Map<string, string>,
  ) {}

  get src(): string {
    return this.attributes.get('src') ?? '';
  }

  set src(value: string) {
    this.srcAssignments.push(value);
  }

  cloneNode(): FakeElement {
    return new FakeElement(this.tagName, new Map(this.attributes));
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name);
  }
}

// ga-init.js が使う「タグ#id[属性="値"]」の形の selector だけを解く
const matches = (element: FakeElement, selectors: string): boolean => {
  const parsed = /^(\w+)#([\w-]+)\[(\w+)="([^"]*)"\]$/u.exec(selectors);
  if (parsed === null) {
    throw new Error(`解けない selector です: ${selectors}`);
  }
  const [, tagName, id, name = '', value] = parsed;
  return (
    element.tagName === tagName &&
    element.attributes.get('id') === id &&
    element.attributes.get(name) === value
  );
};

type GaWindow = EventTarget & {
  dataLayer?: unknown[];
  location: { href: string };
  navigation?: EventTarget;
};

type GaDocument = {
  currentScript: { dataset: Record<string, string> };
  title: string;
  readyState: DocumentReadyState;
  querySelector: (selectors: string) => FakeElement | null;
  head: { appendChild: (node: FakeElement) => void };
};

type Page = {
  window: GaWindow;
  document: GaDocument;
  // layout が HTML に書く、type で止めた gtag.js の script
  inert: FakeElement;
  appended: FakeElement[];
};

const source = readFileSync(
  new URL('../../public/ga-init.js', import.meta.url),
  'utf8',
);

// ブラウザでグローバルにある window と document を、同じ名前の引数で渡して流す
const runGaInit = runInThisContext(
  `(function (window, document) {\n${source}\n})`,
) as (window: GaWindow, document: GaDocument) => void;

const openPage = ({
  href = 'https://k8o.me/',
  title = 'k8o',
  readyState = 'interactive',
  dataLayer,
  navigation = true,
  content = [],
}: {
  href?: string;
  title?: string;
  readyState?: DocumentReadyState;
  dataLayer?: unknown[];
  navigation?: boolean;
  // body で gtag.js の script より前にある要素
  content?: FakeElement[];
} = {}): Page => {
  const inert = new FakeElement(
    'script',
    new Map([
      ['id', 'gtag-js'],
      ['src', GTAG_URL],
      ['type', 'text/plain'],
    ]),
  );
  const elements = [...content, inert];
  const appended: FakeElement[] = [];
  const window: GaWindow = Object.assign(new EventTarget(), {
    ...(dataLayer === undefined ? {} : { dataLayer }),
    location: { href },
    ...(navigation ? { navigation: new EventTarget() } : {}),
  });
  const document: GaDocument = {
    currentScript: { dataset: { gaId: 'G-TEST' } },
    title,
    readyState,
    querySelector: (selectors) =>
      elements.find((element) => matches(element, selectors)) ?? null,
    head: {
      appendChild: (node) => {
        appended.push(node);
      },
    },
  };
  return { window, document, inert, appended };
};

const load = ({ window, document }: Page): void => {
  document.readyState = 'complete';
  window.dispatchEvent(new Event('load'));
};

// router が URL を書き換え、新しいページを描いたあとで Navigation API が navigatesuccess を送る
const finishNavigation = (
  { window, document }: Page,
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

const CONFIG = [
  'config',
  'G-TEST',
  { cookie_flags: 'secure;samesite=lax', send_page_view: false },
];

describe('ga-init.js', () => {
  describe('正常系', () => {
    it('script の data-ga-id の ID で計測を始め、読み込んだページの URL と題で page_view を積む', () => {
      const page = openPage({
        href: 'https://k8o.me/blog',
        title: 'Blog | k8o',
      });

      runGaInit(page.window, page.document);

      expect(commandsOf(page.window.dataLayer)).toStrictEqual([
        ['js', expect.any(Date)],
        CONFIG,
        [
          'event',
          'page_view',
          { page_location: 'https://k8o.me/blog', page_title: 'Blog | k8o' },
        ],
      ]);
    });

    it('GA の cookie に Secure と SameSite=Lax を付けるよう、config に cookie_flags を渡す', () => {
      const page = openPage();

      runGaInit(page.window, page.document);

      const config = commandsOf(page.window.dataLayer).find(
        ([command]) => command === 'config',
      );
      expect(config?.[2]).toHaveProperty('cookie_flags', 'secure;samesite=lax');
    });

    it('gtag.js が読めるよう、コマンドを arguments のオブジェクトで積む', () => {
      const page = openPage();

      runGaInit(page.window, page.document);

      expect(
        page.window.dataLayer?.map((command) =>
          Object.prototype.toString.call(command),
        ),
      ).toStrictEqual([
        '[object Arguments]',
        '[object Arguments]',
        '[object Arguments]',
      ]);
    });

    it('load のあとに、HTML に書いた gtag.js の script を写し、id と type を外して head に足す', () => {
      const page = openPage();
      runGaInit(page.window, page.document);

      load(page);

      expect(page.appended.map((script) => script.attributes)).toStrictEqual([
        new Map([['src', GTAG_URL]]),
      ]);
      expect(page.inert.attributes.get('type')).toBe('text/plain');
    });

    it('ページの替わる遷移が終わると、遷移先の URL と題、遷移元の URL で page_view を積む', () => {
      const page = openPage();
      runGaInit(page.window, page.document);

      finishNavigation(page, 'https://k8o.me/blog', 'Blog | k8o');

      expect(pageViewsOf(page.window.dataLayer)).toStrictEqual([
        { page_location: 'https://k8o.me/', page_title: 'k8o' },
        {
          page_location: 'https://k8o.me/blog',
          page_referrer: 'https://k8o.me/',
          page_title: 'Blog | k8o',
        },
      ]);
    });

    it('戻る・進むでページが替わったときも、遷移ごとに積む', () => {
      const page = openPage({
        href: 'https://k8o.me/blog',
        title: 'Blog | k8o',
      });
      runGaInit(page.window, page.document);

      finishNavigation(page, 'https://k8o.me/about', 'About | k8o');
      finishNavigation(page, 'https://k8o.me/blog', 'Blog | k8o');

      expect(pageViewsOf(page.window.dataLayer).slice(1)).toStrictEqual([
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
    it('load の前には gtag.js を足さない', () => {
      const page = openPage({ readyState: 'interactive' });

      runGaInit(page.window, page.document);

      expect(page.appended).toStrictEqual([]);
    });

    it('load のあとに流れたときは、待たずに gtag.js を足す', () => {
      const page = openPage({ readyState: 'complete' });

      runGaInit(page.window, page.document);

      expect(page.appended).toHaveLength(1);
    });

    it('本文の見出しに同じ id があっても、HTML に書いた gtag.js の script を写す', () => {
      const page = openPage({
        content: [new FakeElement('h2', new Map([['id', 'gtag-js']]))],
      });
      runGaInit(page.window, page.document);

      load(page);

      expect(page.appended.map((element) => element.tagName)).toStrictEqual([
        'script',
      ]);
    });

    it('Trusted Types の sink を通らないよう、gtag.js の script の src に代入しない', () => {
      const page = openPage();
      runGaInit(page.window, page.document);

      load(page);

      expect(page.appended[0]?.srcAssignments).toStrictEqual([]);
    });

    it('gtag.js を足す前に積んだコマンドと遷移の page_view は、足したあとも同じ dataLayer に順に残る', () => {
      const page = openPage();
      runGaInit(page.window, page.document);
      const { dataLayer } = page.window;

      finishNavigation(page, 'https://k8o.me/blog', 'Blog | k8o');
      load(page);

      expect(page.window.dataLayer).toBe(dataLayer);
      expect(commandsOf(dataLayer)).toStrictEqual([
        ['js', expect.any(Date)],
        CONFIG,
        [
          'event',
          'page_view',
          { page_location: 'https://k8o.me/', page_title: 'k8o' },
        ],
        [
          'event',
          'page_view',
          {
            page_location: 'https://k8o.me/blog',
            page_referrer: 'https://k8o.me/',
            page_title: 'Blog | k8o',
          },
        ],
      ]);
    });

    it('パスが同じまま search や hash だけが替わった遷移は数えない', () => {
      const page = openPage({
        href: 'https://k8o.me/blog',
        title: 'Blog | k8o',
      });
      runGaInit(page.window, page.document);

      finishNavigation(page, 'https://k8o.me/blog?q=css', 'Blog | k8o');
      finishNavigation(page, 'https://k8o.me/blog?q=css#2024', 'Blog | k8o');

      expect(pageViewsOf(page.window.dataLayer)).toStrictEqual([
        { page_location: 'https://k8o.me/blog', page_title: 'Blog | k8o' },
      ]);
    });

    it('search が替わったあとに別のページへ移ると、替わったあとの URL を遷移元にする', () => {
      const page = openPage({ href: 'https://k8o.me/blog' });
      runGaInit(page.window, page.document);

      finishNavigation(page, 'https://k8o.me/blog?q=css', 'Blog | k8o');
      finishNavigation(page, 'https://k8o.me/about', 'About | k8o');

      expect(pageViewsOf(page.window.dataLayer).slice(1)).toStrictEqual([
        {
          page_location: 'https://k8o.me/about',
          page_referrer: 'https://k8o.me/blog?q=css',
          page_title: 'About | k8o',
        },
      ]);
    });

    it('Navigation API の無いブラウザでも、読み込んだページの page_view までを積み、load のあとに gtag.js を足す', () => {
      const page = openPage({ navigation: false });

      runGaInit(page.window, page.document);
      load(page);

      expect(commandsOf(page.window.dataLayer)).toStrictEqual([
        ['js', expect.any(Date)],
        CONFIG,
        [
          'event',
          'page_view',
          { page_location: 'https://k8o.me/', page_title: 'k8o' },
        ],
      ]);
      expect(page.appended).toHaveLength(1);
    });

    it('dataLayer が先にあっても、その配列の後ろに積む', () => {
      const queued = { event: 'gtm.js' };
      const dataLayer: unknown[] = [queued];
      const page = openPage({ dataLayer });

      runGaInit(page.window, page.document);

      expect(page.window.dataLayer).toBe(dataLayer);
      expect(dataLayer[0]).toBe(queued);
      expect(commandsOf(dataLayer.slice(1))).toStrictEqual([
        ['js', expect.any(Date)],
        CONFIG,
        [
          'event',
          'page_view',
          { page_location: 'https://k8o.me/', page_title: 'k8o' },
        ],
      ]);
    });
  });
});
