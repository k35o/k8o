import { describe, expect, it } from 'vitest';

import { pagePolicy, securityHeaders } from './security-headers';

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

const production = securityHeaders('production');
const preview = securityHeaders('preview');
const development = securityHeaders('development');
const csp = production['Content-Security-Policy'];
const previewCsp = preview['Content-Security-Policy'];
const devCsp = development['Content-Security-Policy'];

describe('securityHeaders', () => {
  describe('正常系', () => {
    it('本番は、自分のオリジンのほかに GA のスクリプトだけを読む', () => {
      expect(directive(csp, 'script-src')).toBe(
        "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
      );
    });

    it('本番は、自分のオリジンのほかに codepen と GA だけを埋め込む', () => {
      expect(directive(csp, 'frame-src')).toBe(
        "frame-src 'self' https://codepen.io https://www.googletagmanager.com",
      );
    });

    it('自分のオリジンのほかに GA のタグと計測と api にだけ接続する', () => {
      expect(directive(csp, 'connect-src')).toBe(
        "connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://api.k8o.me",
      );
    });

    it('違反を api の送り先に届ける', () => {
      expect(directive(csp, 'report-to')).toBe('report-to csp-endpoint');
      expect(production['Reporting-Endpoints']).toBe(
        'csp-endpoint="https://api.k8o.me/public/reports"',
      );
    });

    it('Trusted Types は Report-Only でだけ縛り、生の文字列を渡す sink とポリシーを作るものを報告する', () => {
      expect(directive(csp, 'require-trusted-types-for')).toBeUndefined();
      expect(directive(csp, 'trusted-types')).toBeUndefined();
      expect(
        directivesOf(production['Content-Security-Policy-Report-Only']),
      ).toStrictEqual([
        "require-trusted-types-for 'script'",
        "trusted-types 'none'",
        'report-to csp-endpoint',
      ]);
    });

    it('ほかのオリジンの窓とは、開いた側と開かれた側の参照を切る', () => {
      expect(production['Cross-Origin-Opener-Policy']).toBe('same-origin');
    });

    it('http の読み込みを https に上げる', () => {
      expect(directive(csp, 'upgrade-insecure-requests')).toBe(
        'upgrade-insecure-requests',
      );
    });

    it('preview は、Vercel が差し込む Toolbar のスクリプトと iframe も許す', () => {
      expect(directive(previewCsp, 'script-src')).toBe(
        "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://vercel.live",
      );
      expect(directive(previewCsp, 'frame-src')).toBe(
        "frame-src 'self' https://codepen.io https://www.googletagmanager.com https://vercel.live",
      );
    });

    it('dev は、React の開発版が使う eval も許す', () => {
      expect(directive(devCsp, 'script-src')).toBe(
        "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com 'unsafe-eval'",
      );
    });

    it('dev は、手元の api にも接続する', () => {
      expect(directive(devCsp, 'connect-src')).toBe(
        "connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://api.k8o.me https://api.k8o.localhost:* https://*.api.k8o.localhost:*",
      );
    });
  });

  describe('エッジケース', () => {
    it('dev は Toolbar が差し込まれないので、vercel.live を許さない', () => {
      expect(directive(devCsp, 'frame-src')).toBe(
        "frame-src 'self' https://codepen.io https://www.googletagmanager.com",
      );
    });

    it('dev は、Safari が localhost の http まで https に上げないよう、upgrade-insecure-requests を付けない', () => {
      expect(directive(devCsp, 'upgrade-insecure-requests')).toBeUndefined();
    });
  });
});

describe('pagePolicy', () => {
  const themeHash = "'sha256-theme'";

  describe('正常系', () => {
    it('inline の script は、テーマのハッシュでだけ許し、外は GA のスクリプトだけを読む', () => {
      expect(pagePolicy('production', themeHash)).toStrictEqual({
        'script-src': [
          "'self'",
          "'sha256-theme'",
          'https://www.googletagmanager.com',
        ],
      });
    });

    it('preview は、Vercel が差し込む Toolbar のスクリプトも許す', () => {
      expect(pagePolicy('preview', themeHash)).toStrictEqual({
        'script-src': [
          "'self'",
          "'sha256-theme'",
          'https://www.googletagmanager.com',
          'https://vercel.live',
        ],
      });
    });
  });

  describe('エッジケース', () => {
    it('頭の CSP は、ページごとのハッシュを持てないので inline の script を許したままにする', () => {
      expect(directive(csp, 'script-src')).toContain("'unsafe-inline'");
    });
  });
});
