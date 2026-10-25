import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { chromium } from 'playwright';
import type { BrowserContext } from 'playwright';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { findLeakedRequests, readNetLogLines } from './net-log';
import type { LeakedRequest } from './net-log';

const REQUEST_ALIVE = 1;
const START_JOB = 136;
const SEND_REQUEST = 239;

const constantsOf = (logEventTypes: Record<string, number>): string =>
  `{"constants":{"logEventPhase":{"PHASE_BEGIN":1,"PHASE_END":2,"PHASE_NONE":0},"logEventTypes":${JSON.stringify(logEventTypes)}},`;

const constants = constantsOf({
  REQUEST_ALIVE,
  URL_REQUEST_START_JOB: START_JOB,
  HTTP_TRANSACTION_SEND_REQUEST: SEND_REQUEST,
});

const eventOf = (
  id: number,
  type: number,
  phase: number,
  params?: Record<string, unknown>,
): string =>
  JSON.stringify({
    ...(params === undefined ? {} : { params }),
    phase,
    source: { id, start_time: '1', type: 1 },
    time: '1',
    type,
  });

const startJob = (id: number, method: string, url: string): string =>
  eventOf(id, START_JOB, 1, {
    initiator: 'https://k8o.me',
    load_flags: 0,
    method,
    url,
  });

const endJob = (id: number): string => eventOf(id, START_JOB, 2);

const sendRequest = (id: number): string[] => [
  eventOf(id, SEND_REQUEST, 1),
  eventOf(id, SEND_REQUEST, 2),
];

const sent = (id: number, method: string, url: string): string[] => [
  startJob(id, method, url),
  ...sendRequest(id),
  endJob(id),
];

// Chromium の --log-net-log は、constants を1行目に、イベントを1行に1つずつ書き、最後のイベントの行で配列を閉じる
const netLogOf = (
  events: readonly string[],
  header: string = constants,
): string[] => [
  header,
  '"events": [',
  ...events.map((event, index) =>
    index === events.length - 1 ? `${event}],` : `${event},`,
  ),
  '"polledData": {"reportingInfo":{"reports":[]}}',
  '}',
];

const linesOf = async function* (
  lines: readonly string[],
): AsyncGenerator<string> {
  yield* lines;
};

const VITALS = '/_vercel/speed-insights/vitals';

let origin = '';
const received: string[] = [];

const server = createServer((request, response) => {
  received.push(`${request.method ?? ''} ${request.url ?? ''}`);
  response.writeHead(200, { 'content-type': 'text/html' });
  response.end('<!doctype html><title>t</title>');
});

const findLeakedRequestsIn = async (
  run: (context: BrowserContext) => Promise<void>,
): Promise<LeakedRequest[]> => {
  const dir = await mkdtemp(join(tmpdir(), 'k8o-smoke-pages-net-log-test-'));
  try {
    const file = join(dir, 'netlog.json');
    const browser = await chromium.launch({ args: [`--log-net-log=${file}`] });
    try {
      const context = await browser.newContext();
      await run(context);
      await context.close();
    } finally {
      await browser.close();
    }
    return await findLeakedRequests(readNetLogLines(file));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
};

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address() as AddressInfo;
  origin = `http://127.0.0.1:${String(port)}`;
});

beforeEach(() => {
  received.length = 0;
});

afterAll(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve) => {
    server.close(() => {
      resolve();
    });
  });
});

describe('findLeakedRequests', { timeout: 60_000 }, () => {
  describe('正常系', () => {
    it('送った要求のうち、止めるはずのものだけを並べる', async () => {
      const lines = netLogOf([
        ...sent(1, 'GET', 'https://k8o.me/blog/abs-sign'),
        ...sent(2, 'POST', 'https://api.k8o.me/public/blogs/abs-sign/views'),
        ...sent(3, 'GET', 'https://api.k8o.me/public/reading-list'),
        ...sent(4, 'POST', 'https://k8o.me/_vercel/speed-insights/vitals'),
        ...sent(
          5,
          'POST',
          'https://region1.google-analytics.com/g/collect?v=2&en=page_view',
        ),
      ]);

      await expect(findLeakedRequests(linesOf(lines))).resolves.toStrictEqual([
        {
          category: 'api',
          method: 'POST',
          url: 'https://api.k8o.me/public/blogs/abs-sign/views',
        },
        {
          category: 'speed-insights',
          method: 'POST',
          url: 'https://k8o.me/_vercel/speed-insights/vitals',
        },
        {
          category: 'ga',
          method: 'POST',
          url: 'https://region1.google-analytics.com/g/collect?v=2&en=page_view',
        },
      ]);
    });

    it('止めるはずの要求を送っていなければ空にする', async () => {
      const lines = netLogOf(sent(1, 'GET', 'https://k8o.me/'));

      await expect(findLeakedRequests(linesOf(lines))).resolves.toStrictEqual(
        [],
      );
    });

    it('Chromium が送った止めるはずの要求を、Chromium の netlog から並べる', async () => {
      const leaked = await findLeakedRequestsIn(async (context) => {
        const page = await context.newPage();
        await page.goto(`${origin}/`);
        await page.evaluate(async (url) => {
          await fetch(url, { method: 'POST', body: 'sent' });
        }, `${origin}${VITALS}`);
      });

      expect(received.filter((line) => line.includes(VITALS))).toStrictEqual([
        `POST ${VITALS}`,
      ]);
      expect(leaked).toStrictEqual([
        {
          category: 'speed-insights',
          method: 'POST',
          url: `${origin}${VITALS}`,
        },
      ]);
    });
  });

  describe('エッジケース', () => {
    it('始めたが送る前に取り消された要求は並べない', async () => {
      const lines = netLogOf([
        ...sent(1, 'GET', 'https://k8o.me/'),
        startJob(2, 'POST', 'https://k8o.me/_vercel/speed-insights/vitals'),
        endJob(2),
      ]);

      await expect(findLeakedRequests(linesOf(lines))).resolves.toStrictEqual(
        [],
      );
    });

    it('redirect の前とあとの要求は、それぞれ送った時点の URL で分ける', async () => {
      const lines = netLogOf([
        startJob(1, 'POST', 'https://k8o.me/_vercel/speed-insights/vitals'),
        ...sendRequest(1),
        endJob(1),
        ...sent(1, 'POST', 'https://k8o.me/'),
        startJob(2, 'POST', 'https://k8o.me/old'),
        ...sendRequest(2),
        endJob(2),
        ...sent(2, 'POST', 'https://api.k8o.me/public/blogs/abs-sign/views'),
      ]);

      await expect(findLeakedRequests(linesOf(lines))).resolves.toStrictEqual([
        {
          category: 'speed-insights',
          method: 'POST',
          url: 'https://k8o.me/_vercel/speed-insights/vitals',
        },
        {
          category: 'api',
          method: 'POST',
          url: 'https://api.k8o.me/public/blogs/abs-sign/views',
        },
      ]);
    });

    it('要求を始めた記録でないイベントの URL は見ない', async () => {
      const lines = netLogOf([
        eventOf(1, REQUEST_ALIVE, 1, {
          url: 'https://api.k8o.me/public/reports',
        }),
        ...sent(1, 'GET', 'https://k8o.me/'),
      ]);

      await expect(findLeakedRequests(linesOf(lines))).resolves.toStrictEqual(
        [],
      );
    });

    it('route で止めたまま context を閉じて取り消された要求は、Chromium の netlog に始めた記録があっても並べない', async () => {
      const leaked = await findLeakedRequestsIn(async (context) => {
        const { promise: routed, resolve } = Promise.withResolvers<undefined>();
        await context.route(
          (url) => url.pathname === VITALS,
          () => {
            // 応えずに持ち続け、止めている最中のまま context を閉じる
            resolve(undefined);
          },
        );
        const page = await context.newPage();
        await page.goto(`${origin}/`);
        await page.evaluate((url) => {
          fetch(url, { method: 'POST', body: 'held' }).catch(() => {});
        }, `${origin}${VITALS}`);
        await routed;
      });

      expect(received.filter((line) => line.includes(VITALS))).toStrictEqual(
        [],
      );
      expect(leaked).toStrictEqual([]);
    });
  });

  describe('異常系', () => {
    it('要求を送った記録が1つも無ければ、読み方が合わないとして止める', async () => {
      const lines = netLogOf([
        startJob(1, 'POST', 'https://k8o.me/_vercel/speed-insights/vitals'),
        endJob(1),
      ]);

      await expect(findLeakedRequests(linesOf(lines))).rejects.toThrow(
        'netlog',
      );
    });

    it('constants に要求を送るイベントの番号が無ければ止める', async () => {
      const lines = netLogOf(
        sent(1, 'POST', 'https://k8o.me/_vercel/speed-insights/vitals'),
        constantsOf({ REQUEST_ALIVE, URL_REQUEST_START_JOB: START_JOB }),
      );

      await expect(findLeakedRequests(linesOf(lines))).rejects.toThrow(
        'HTTP_TRANSACTION_SEND_REQUEST',
      );
    });

    it('constants が無ければ止める', async () => {
      await expect(
        findLeakedRequests(
          linesOf(
            netLogOf(
              sent(1, 'POST', 'https://k8o.me/_vercel/speed-insights/vitals'),
            ).slice(1),
          ),
        ),
      ).rejects.toThrow('netlog');
    });
  });
});
