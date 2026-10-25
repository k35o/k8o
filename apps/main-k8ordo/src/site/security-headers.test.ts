import { describe, expect, it } from 'vitest';

import { DEV_SECURITY_HEADERS, SECURITY_HEADERS } from './security-headers';

const directivesOf = (policy: string | undefined): string[] =>
  (policy ?? '')
    .split(';')
    .map((directive) => directive.trim())
    .filter((directive) => directive !== '');

const directive = (
  policy: string | undefined,
  name: string,
): string | undefined =>
  directivesOf(policy).find(
    (entry) => entry === name || entry.startsWith(`${name} `),
  );

const csp = SECURITY_HEADERS['Content-Security-Policy'];
const devCsp = DEV_SECURITY_HEADERS['Content-Security-Policy'];

describe('SECURITY_HEADERS', () => {
  describe('正常系', () => {
    it('自分のオリジンのほかに GA と Vercel のツールバーのスクリプトだけを読む', () => {
      expect(directive(csp, 'script-src')).toBe(
        "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://vercel.live",
      );
    });

    it('自分のオリジンのほかに GA と api にだけ接続する', () => {
      expect(directive(csp, 'connect-src')).toBe(
        "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://api.k8o.me",
      );
    });

    it('違反を api の送り先に届ける', () => {
      expect(directive(csp, 'report-to')).toBe('report-to csp-endpoint');
      expect(SECURITY_HEADERS['Reporting-Endpoints']).toBe(
        'csp-endpoint="https://api.k8o.me/public/reports"',
      );
    });

    it('Trusted Types は Report-Only でだけ縛る', () => {
      expect(directive(csp, 'trusted-types')).toBeUndefined();
      expect(
        directivesOf(SECURITY_HEADERS['Content-Security-Policy-Report-Only']),
      ).toStrictEqual([
        "require-trusted-types-for 'script'",
        'report-to csp-endpoint',
      ]);
    });

    it('http の読み込みを https に上げる', () => {
      expect(directive(csp, 'upgrade-insecure-requests')).toBe(
        'upgrade-insecure-requests',
      );
    });
  });
});

describe('DEV_SECURITY_HEADERS', () => {
  describe('正常系', () => {
    it('React の開発版が使う eval も許す', () => {
      expect(directive(devCsp, 'script-src')).toBe(
        "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://vercel.live 'unsafe-eval'",
      );
    });

    it('手元の api にも接続する', () => {
      expect(directive(devCsp, 'connect-src')).toBe(
        "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://api.k8o.me https://api.k8o.localhost:* https://*.api.k8o.localhost:*",
      );
    });
  });

  describe('エッジケース', () => {
    it('Safari が localhost の http まで https に上げないよう、upgrade-insecure-requests を付けない', () => {
      expect(directive(devCsp, 'upgrade-insecure-requests')).toBeUndefined();
    });
  });
});
