import { PHASE_PRODUCTION_SERVER } from 'next/constants';
import { afterEach, describe, expect, it, vi } from 'vitest';

const cspDirective = async (
  nodeEnv: string,
  name: string,
): Promise<string | undefined> => {
  vi.stubEnv('NODE_ENV', nodeEnv);
  // CSP の中身はモジュールを読んだときの NODE_ENV で決まるので、毎回読み直す
  vi.resetModules();
  const { default: createConfig } = await import('./next.config');
  const config = await createConfig(PHASE_PRODUCTION_SERVER);
  const routes = (await config.headers?.()) ?? [];
  const csp = routes
    .find((route) => route.source === '/(.*)')
    ?.headers.find(({ key }) => key === 'Content-Security-Policy')?.value;
  return csp
    ?.split(';')
    .map((directive) => directive.trim())
    .find((directive) => directive.startsWith(`${name} `));
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('Content-Security-Policy', () => {
  describe('正常系', () => {
    it('本番は、自分のオリジンのほかに GA と Vercel のツールバーのスクリプトだけを読む', async () => {
      await expect(cspDirective('production', 'script-src')).resolves.toBe(
        "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://vercel.live",
      );
    });

    it('本番は、自分のオリジンのほかに GA と api にだけ接続する', async () => {
      await expect(cspDirective('production', 'connect-src')).resolves.toBe(
        "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://api.k8o.me",
      );
    });

    it('dev は、eval と Speed Insights のデバッグ用のスクリプトも読む', async () => {
      await expect(cspDirective('development', 'script-src')).resolves.toBe(
        "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://vercel.live 'unsafe-eval' https://va.vercel-scripts.com",
      );
    });

    it('dev は、手元の api にも接続する', async () => {
      await expect(cspDirective('development', 'connect-src')).resolves.toBe(
        "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://api.k8o.me https://api.k8o.localhost:* https://*.api.k8o.localhost:*",
      );
    });
  });
});
