import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { chromium } from 'playwright';
import type { Browser } from 'playwright';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { visitPage } from './visit';

const VITALS = '/_vercel/speed-insights/vitals';

// 読み込みのときと、ページを離れるときに Speed Insights と同じ形で送る
const sendsVitals = (otherOrigin: string): string => `<script>
navigator.sendBeacon('${VITALS}', 'load');
fetch('${VITALS}?keepalive', { method: 'POST', keepalive: true, body: 'load' });
fetch('${otherOrigin}${VITALS}?cors', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: '{}',
}).catch(() => {});
const leave = (why) => {
  navigator.sendBeacon('${VITALS}?' + why, why);
  fetch('${VITALS}?keepalive-' + why, { method: 'POST', keepalive: true, body: why });
};
addEventListener('pagehide', () => leave('pagehide'));
document.addEventListener('visibilitychange', () => leave('visibilitychange'));
addEventListener('beforeunload', () => leave('beforeunload'));
</script>`;

// 閉じる時点で、送っている最中の要求が残るようにする
const keepsSendingVitals = `<script>
setInterval(() => {
  navigator.sendBeacon('${VITALS}?interval', 'interval');
  fetch('${VITALS}?keepalive-interval', { method: 'POST', keepalive: true, body: 'interval' });
}, 20);
</script>`;

const GA_COLLECT = 'https://region1.google-analytics.com/g/collect';

// クライアントの router のように pushState で移り、GA と Speed Insights と同じ形で送る
const navigatesInDocument = ({
  pageViewDelayMs,
}: {
  pageViewDelayMs: number | null;
}): string => `<main><a id="next" href="/next">next</a></main><script>
const pageView = () => navigator.sendBeacon(
  '${GA_COLLECT}?v=2&en=page_view&dl=' + encodeURIComponent(location.href),
);
pageView();
document.getElementById('next').addEventListener('click', (event) => {
  event.preventDefault();
  history.pushState(null, '', '/next');
  ${pageViewDelayMs === null ? '' : `setTimeout(pageView, ${String(pageViewDelayMs)});`}
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    navigator.sendBeacon('${VITALS}', JSON.stringify({
      metrics: [{ type: 'CLS', route: location.pathname, href: location.href }],
    }));
  }
});
</script>`;

const html = (body: string): string =>
  `<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>t</title></head><body>${body}</body></html>`;

let origin = '';
let otherOrigin = '';
let browser: Browser;
const received: string[] = [];

type TestPage = {
  readonly status: number;
  readonly headers?: Record<string, string>;
  readonly body: string;
};

const pageAt = (path: string): TestPage => {
  switch (path) {
    case '/vitals':
      return {
        status: 200,
        body: html(`<main>vitals</main>${sendsVitals(otherOrigin)}`),
      };
    case '/keeps-sending':
      return {
        status: 200,
        body: html(
          `<main>keeps sending</main>${sendsVitals(otherOrigin)}${keepsSendingVitals}`,
        ),
      };
    case '/errors':
      return {
        status: 200,
        body: html(
          "<script>console.error('壊れた');</script><script>throw new Error('投げた');</script>",
        ),
      };
    case '/csp':
      return {
        status: 200,
        headers: {
          'content-security-policy': "img-src 'self'",
          'content-security-policy-report-only': "img-src 'none'",
        },
        body: html(
          `<img src="${otherOrigin}/enforced.png" alt=""><img src="/report-only.png" alt="">`,
        ),
      };
    case '/challenge':
      return {
        status: 429,
        headers: { 'x-vercel-mitigated': 'challenge' },
        body: html('challenge'),
      };
    case '/busy':
      return {
        status: 200,
        body: html("<main>busy</main><script>fetch('/hang');</script>"),
      };
    case '/soft':
      return {
        status: 200,
        body: html(navigatesInDocument({ pageViewDelayMs: 0 })),
      };
    case '/soft-without-page-view':
      return {
        status: 200,
        body: html(navigatesInDocument({ pageViewDelayMs: null })),
      };
    case '/soft-late-page-view':
      return {
        status: 200,
        body: html(navigatesInDocument({ pageViewDelayMs: 6000 })),
      };
    case '/hard':
      return {
        status: 200,
        body: html(
          `<main><a href="/next">next</a></main>${sendsVitals(otherOrigin)}`,
        ),
      };
    case '/next':
      return { status: 200, body: html('<main>next</main>') };
    case '/ok':
      return { status: 200, body: html('<main>ok</main>') };
    default:
      return { status: 404, body: html('not found') };
  }
};

const server = createServer((request, response) => {
  received.push(`${request.method ?? ''} ${request.url ?? ''}`);
  const path = new URL(request.url ?? '/', origin).pathname;
  if (path === '/hang') {
    // 応えずに持ち続け、ページの通信を静まらせない
    return;
  }
  const { status, headers, body } = pageAt(path);
  response.writeHead(status, { 'content-type': 'text/html', ...headers });
  response.end(body);
});

const optionsFor = (
  path: string,
  overrides: Partial<Parameters<typeof visitPage>[1]> = {},
): Parameters<typeof visitPage>[1] => ({
  origin,
  path,
  expectedStatus: 200,
  checksNavigation: false,
  screenshotPath: null,
  bypassSecret: null,
  ...overrides,
});

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address() as AddressInfo;
  origin = `http://127.0.0.1:${String(port)}`;
  // ポートが同じでもホスト名が違えば別のオリジンになる
  otherOrigin = `http://localhost:${String(port)}`;
  browser = await chromium.launch();
});

beforeEach(() => {
  received.length = 0;
});

afterAll(async () => {
  await browser.close();
  server.closeAllConnections();
  await new Promise<void>((resolve) => {
    server.close(() => {
      resolve();
    });
  });
});

describe('visitPage', { timeout: 60_000 }, () => {
  describe('正常系', () => {
    it('誤りの無いページは、status だけを返す', async () => {
      const visit = await visitPage(browser, optionsFor('/ok'));

      expect(visit).toStrictEqual({
        status: 200,
        mitigated: null,
        problems: [],
        notes: [],
        reportOnly: [],
        blocked: [],
      });
    });

    it('計測の送信を止めて並べ、外へは出さない', async () => {
      const visit = await visitPage(browser, optionsFor('/vitals'));

      expect(visit.problems).toStrictEqual([]);
      expect(
        visit.blocked.map(({ category, url }) => `${category} ${url}`),
      ).toStrictEqual(
        expect.arrayContaining([
          `speed-insights ${origin}${VITALS}`,
          `speed-insights ${origin}${VITALS}?keepalive`,
          `speed-insights ${otherOrigin}${VITALS}?cors`,
        ]),
      );
      expect(received.filter((line) => line.includes(VITALS))).toStrictEqual(
        [],
      );
    });

    it('開き終えたあとも、送っている最中の要求とページを離れるときの送信を外へ出さない', async () => {
      await visitPage(browser, optionsFor('/keeps-sending'));
      // 閉じたページの keepalive の要求が届くなら、この間に届く
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });

      expect(received).toStrictEqual(['GET /keeps-sending']);
    });

    it('GA が遷移の page_view をまとめて遅れて送っても、届くまで待つ', async () => {
      const visit = await visitPage(
        browser,
        optionsFor('/soft-late-page-view', { checksNavigation: true }),
      );

      expect(visit.problems).toStrictEqual([]);
      expect(visit.notes).toStrictEqual(
        expect.arrayContaining([
          `遷移のあとの GA の page_view: ${origin}/next`,
        ]),
      );
    });

    it('渡したパスに、ページ全体のスクリーンショットを JPEG で書く', async () => {
      const dir = await mkdtemp(join(tmpdir(), 'k8o-smoke-pages-test-'));
      try {
        const screenshotPath = join(dir, 'ok.jpeg');
        const visit = await visitPage(
          browser,
          optionsFor('/ok', { screenshotPath }),
        );

        expect(visit.problems).toStrictEqual([]);
        expect([
          ...(await readFile(screenshotPath)).subarray(0, 3),
        ]).toStrictEqual([0xff, 0xd8, 0xff]);
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    });

    it('内部リンクを押して文書を読み込まずに移ったことと、移ったあとの計測を、送らずに並べる', async () => {
      const visit = await visitPage(
        browser,
        optionsFor('/soft', { checksNavigation: true }),
      );

      expect(visit.problems).toStrictEqual([]);
      expect(visit.notes).toStrictEqual([
        '遷移: /soft から /next へ、文書を読み込まずに移った',
        `遷移のあとの GA の page_view: ${origin}/next`,
        `遷移のあとの Speed Insights: CLS route=/next href=${origin}/next`,
      ]);
      expect(received).toStrictEqual(['GET /soft']);
    });
  });

  describe('異常系', () => {
    it('ページの例外と console.error を誤りに並べる', async () => {
      const visit = await visitPage(browser, optionsFor('/errors'));

      expect(visit.problems).toHaveLength(2);
      expect(visit.problems).toStrictEqual(
        expect.arrayContaining(['console.error: 壊れた', 'pageerror: 投げた']),
      );
    });

    it('強制側の CSP の違反は誤りに、Report-Only の違反は別に並べる', async () => {
      const visit = await visitPage(browser, optionsFor('/csp'));

      expect(visit.problems).toStrictEqual(
        expect.arrayContaining([`CSP: img-src ${otherOrigin}/enforced.png`]),
      );
      expect(visit.reportOnly).toHaveLength(2);
      expect(visit.reportOnly).toStrictEqual(
        expect.arrayContaining([
          `img-src ${otherOrigin}/enforced.png`,
          `img-src ${origin}/report-only.png`,
        ]),
      );
    });

    it('status が違えば誤りにする', async () => {
      const visit = await visitPage(browser, optionsFor('/missing'));

      expect(visit.status).toBe(404);
      expect(visit.problems).toStrictEqual(
        expect.arrayContaining(['status: 404（200 のはず）']),
      );
    });

    it('押した内部リンクで文書を読み込んだら誤りにし、離れるときの送信も外へ出さない', async () => {
      const visit = await visitPage(
        browser,
        optionsFor('/hard', { checksNavigation: true }),
      );

      expect(visit.problems).toStrictEqual([
        '遷移: /hard から /next へ移るときに文書を読み込んだ',
      ]);
      expect(received).toStrictEqual(['GET /hard', 'GET /next']);
    });

    it('GA を使うページで、移ったあとの page_view が無ければ誤りにする', async () => {
      const visit = await visitPage(
        browser,
        optionsFor('/soft-without-page-view', { checksNavigation: true }),
      );

      expect(visit.problems).toStrictEqual([
        '遷移のあとに /next の GA の page_view が送られない',
      ]);
    });

    it('押せる内部リンクが <main> に無ければ誤りにする', async () => {
      const visit = await visitPage(
        browser,
        optionsFor('/ok', { checksNavigation: true }),
      );

      expect(visit.problems).toStrictEqual([
        '遷移: <main> に押せる内部リンクが無い',
      ]);
    });

    it('Firewall に止められたら、それを返す', async () => {
      const visit = await visitPage(browser, optionsFor('/challenge'));

      expect(visit.mitigated).toBe('challenge');
    });
  });

  describe('エッジケース', () => {
    it('通信が静まらないページも、誤りにせずに開き終える', async () => {
      const visit = await visitPage(browser, optionsFor('/busy'));

      expect(visit.problems).toStrictEqual([]);
    });

    it('無いパスは、404 を待っていれば誤りにしない', async () => {
      const visit = await visitPage(
        browser,
        optionsFor('/missing', { expectedStatus: 404 }),
      );

      expect(visit.problems).toStrictEqual([]);
    });
  });
});
