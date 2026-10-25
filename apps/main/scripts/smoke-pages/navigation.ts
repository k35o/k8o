import type { Page } from 'playwright';

import { gaEventsOf, speedInsightsMetricsOf } from './beacons';
import type { BlockedRequest } from './requests';

type NavigationCheck = {
  readonly problems: readonly string[];
  readonly notes: readonly string[];
};

const INTERNAL_LINK = 'main a[href^="/"]:not([href^="//"])';
const DOCUMENT_MARK = '__k8oSmokePagesDocument';
const NAVIGATION_TIMEOUT_MS = 10_000;
// 文書を読み込まない遷移には読み込みの終わりの合図が無いので、描き終えるのを時間で待つ
const NAVIGATION_SETTLE_MS = 2000;
const FLUSH_MS = 1000;

const pathnameOf = (url: string): string | null =>
  URL.canParse(url) ? new URL(url).pathname : null;

// GA と Speed Insights は画面が隠れたときにまとめて送る。ページを閉じずに隠れたことにして送らせ、
// route で止めて中身を見る
const hidePage = (): void => {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => 'hidden',
  });
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: () => true,
  });
  document.dispatchEvent(new Event('visibilitychange', { bubbles: true }));
};

const pageViewsTo = (to: string, after: readonly BlockedRequest[]): string[] =>
  after
    .filter(({ category }) => category === 'ga')
    .flatMap(({ url, body }) => gaEventsOf(url, body))
    .flatMap(({ name, location }) =>
      name === 'page_view' && location !== null && pathnameOf(location) === to
        ? [location]
        : [],
    );

const speedInsightsNote = (after: readonly BlockedRequest[]): string => {
  const metrics = after
    .filter(({ category }) => category === 'speed-insights')
    .flatMap(({ body }) => speedInsightsMetricsOf(body));
  return metrics.length === 0
    ? '遷移のあとの Speed Insights: 送られない'
    : `遷移のあとの Speed Insights: ${metrics
        .map(
          ({ type, route, href }) =>
            `${type} route=${route ?? '-'} href=${href ?? '-'}`,
        )
        .join('、')}`;
};

// blocked は route が止めた要求を足していく配列で、押したあとに足されたものを遷移のあとの要求とみなす
export const checkNavigation = async (
  page: Page,
  blocked: readonly BlockedRequest[],
): Promise<NavigationCheck> => {
  const link = page.locator(INTERNAL_LINK).filter({ visible: true }).first();
  if ((await link.count()) === 0) {
    return { problems: ['遷移: <main> に押せる内部リンクが無い'], notes: [] };
  }
  const from = new URL(page.url()).pathname;
  const usesGa = blocked.some(({ category }) => category === 'ga');
  await page.evaluate((mark) => {
    Reflect.set(window, mark, true);
  }, DOCUMENT_MARK);
  const firstAfter = blocked.length;
  await link.click({ timeout: NAVIGATION_TIMEOUT_MS });
  const moved = await page
    .waitForURL((url) => url.pathname !== from, {
      timeout: NAVIGATION_TIMEOUT_MS,
    })
    .then(
      () => true,
      () => false,
    );
  if (!moved) {
    return {
      problems: [`遷移: ${from} の内部リンクを押しても URL が替わらない`],
      notes: [],
    };
  }
  await page.waitForTimeout(NAVIGATION_SETTLE_MS);
  const to = new URL(page.url()).pathname;
  const inDocument = await page.evaluate(
    (mark) => Reflect.get(window, mark) === true,
    DOCUMENT_MARK,
  );
  await page.evaluate(hidePage);
  await page.waitForTimeout(FLUSH_MS);
  const after = blocked.slice(firstAfter);
  const problems: string[] = [];
  const notes: string[] = [];
  if (inDocument) {
    notes.push(`遷移: ${from} から ${to} へ、文書を読み込まずに移った`);
  } else {
    problems.push(`遷移: ${from} から ${to} へ移るときに文書を読み込んだ`);
  }
  if (usesGa) {
    const pageViews = pageViewsTo(to, after);
    if (pageViews.length === 0) {
      problems.push(`遷移のあとに ${to} の GA の page_view が送られない`);
    } else {
      notes.push(`遷移のあとの GA の page_view: ${pageViews.join('、')}`);
    }
  } else {
    notes.push('遷移のあとの GA: 読み込みで collect が無いので見ていない');
  }
  notes.push(speedInsightsNote(after));
  return { problems, notes };
};
