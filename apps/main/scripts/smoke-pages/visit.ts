import type { Browser, ConsoleMessage } from 'playwright';
import { z } from 'zod';

import { blockedCategoryOf, bypassHeadersFor } from './requests';
import type { BlockedCategory } from './requests';

export type BlockedRequest = {
  readonly category: BlockedCategory;
  readonly method: string;
  readonly url: string;
};

export type Visit = {
  readonly status: number | null;
  readonly mitigated: string | null;
  readonly problems: readonly string[];
  readonly reportOnly: readonly string[];
  readonly blocked: readonly BlockedRequest[];
};

type VisitOptions = {
  readonly origin: string;
  readonly path: string;
  readonly expectedStatus: number;
  readonly bypassSecret: string | null;
};

const LOAD_TIMEOUT_MS = 30_000;
// SharedWorker を動かすページは networkidle に届かないので、静まるのを待つのは少しだけにする
const SETTLE_TIMEOUT_MS = 5000;
const VIOLATION_BINDING = '__k8oSmokePagesViolation';

const violationSchema = z.object({
  disposition: z.enum(['enforce', 'report']),
  directive: z.string(),
  blockedURI: z.string(),
  sample: z.string(),
});

// addInitScript はこの関数を文字列にしてページで走らせるので、外の変数を参照しない
const watchViolations = (bindingName: string): void => {
  document.addEventListener(
    'securitypolicyviolation',
    (event) => {
      const report: unknown = Reflect.get(window, bindingName);
      if (typeof report === 'function') {
        Reflect.apply(report, window, [
          {
            disposition: event.disposition,
            directive: event.effectiveDirective,
            blockedURI: event.blockedURI,
            sample: event.sample,
          },
        ]);
      }
    },
    true,
  );
};

const FAILED_RESOURCE = 'Failed to load resource: ';

// Chromium は読めなかった資源の URL を文に入れず、場所にだけ持たせる
const describeConsoleError = (message: ConsoleMessage): string => {
  const text = message.text();
  return text.startsWith(FAILED_RESOURCE)
    ? `console.error: ${text} (${message.location().url})`
    : `console.error: ${text}`;
};

// 404 を待つページでも、Chromium は文書の 404 を console.error に出す
const isExpectedDocumentStatus = (
  problem: string,
  documentUrl: string,
  expectedStatus: number,
): boolean =>
  problem.startsWith(
    `console.error: ${FAILED_RESOURCE}the server responded with a status of ${String(expectedStatus)} `,
  ) && problem.endsWith(`(${documentUrl})`);

const unique = (lines: readonly string[]): string[] => [...new Set(lines)];

export const visitPage = async (
  browser: Browser,
  { origin, path, expectedStatus, bypassSecret }: VisitOptions,
): Promise<Visit> => {
  const problems: string[] = [];
  const reportOnly: string[] = [];
  const blocked: BlockedRequest[] = [];
  // ページを閉じると、離れるときの keepalive・beacon の要求が route を通らずに外へ出る。
  // context ごと捨てると、ページを離れるときの処理が走らない
  const context = await browser.newContext();
  try {
    await context.exposeBinding(
      VIOLATION_BINDING,
      (_source, value: unknown) => {
        const { disposition, directive, blockedURI, sample } =
          violationSchema.parse(value);
        const violation = [directive, blockedURI, sample]
          .filter((part) => part !== '')
          .join(' ');
        if (disposition === 'enforce') {
          problems.push(`CSP: ${violation}`);
        } else {
          reportOnly.push(violation);
        }
      },
    );
    await context.addInitScript(watchViolations, VIOLATION_BINDING);
    await context.route('**/*', async (route) => {
      const request = route.request();
      const method = request.method();
      const url = request.url();
      const category = blockedCategoryOf(method, url);
      if (category !== null) {
        blocked.push({ category, method, url });
        await route.fulfill({
          status: 204,
          headers: {
            'access-control-allow-origin': origin,
            'access-control-allow-credentials': 'true',
          },
        });
        return;
      }
      const headers = bypassHeadersFor(url, origin, bypassSecret);
      await route.continue(
        Object.keys(headers).length === 0
          ? undefined
          : { headers: { ...request.headers(), ...headers } },
      );
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => {
      problems.push(`pageerror: ${error.message}`);
    });
    page.on('console', (message) => {
      if (message.type() === 'error') {
        problems.push(describeConsoleError(message));
      }
    });
    const response = await page
      .goto(new URL(path, origin).href, { timeout: LOAD_TIMEOUT_MS })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        // Playwright は呼び出しの記録を2行目から足す
        problems.push(`読み込み: ${message.split('\n')[0] ?? message}`);
        return null;
      });
    await page
      .waitForLoadState('networkidle', { timeout: SETTLE_TIMEOUT_MS })
      .catch(() => {
        // 静まらなくても、ここまでに出た誤りで判断する
      });
    const status = response?.status() ?? null;
    if (status !== null && status !== expectedStatus) {
      problems.push(
        `status: ${String(status)}（${String(expectedStatus)} のはず）`,
      );
    }
    const documentUrl = response?.url() ?? '';
    return {
      status,
      mitigated: response?.headers()['x-vercel-mitigated'] ?? null,
      problems: unique(problems).filter(
        (problem) =>
          !isExpectedDocumentStatus(problem, documentUrl, expectedStatus),
      ),
      reportOnly: unique(reportOnly),
      blocked,
    };
  } finally {
    await context.close();
  }
};
