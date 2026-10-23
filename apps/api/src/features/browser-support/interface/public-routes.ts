import { Hono } from 'hono';
import { validator } from 'hono/validator';
import * as z from 'zod/mini';

import { publicCacheControl } from '../../../shared/cache/public-cache-control';
import { getBrowserSupportHealth } from '../application/browser-support-health';
import {
  findFeatureStatus,
  getBrowserSupportSnapshot,
} from '../application/browser-support-snapshot';

const CACHE_HEADERS = {
  'Cache-Control': publicCacheControl({ maxAge: 300, sMaxAge: 3600 }),
};

const featureParamSchema = z.object({
  featureId: z.string().check(z.regex(/^[a-z0-9-]{1,100}$/u)),
});

export const browserSupportPublicRoutes = new Hono()
  .get('/', async (c) =>
    c.json(await getBrowserSupportSnapshot(Date.now()), 200, CACHE_HEADERS),
  )
  .get(
    '/features/:featureId',
    validator('param', (value, c) => {
      const parsed = featureParamSchema.safeParse(value);
      return parsed.success
        ? parsed.data
        : c.json({ ok: false, error: 'invalid_request' } as const, 400);
    }),
    async (c) => {
      const feature = await findFeatureStatus(c.req.valid('param').featureId);
      // 無いことはデータで決まる答えなので、200 と同じだけ CDN に持たせ、DB に届かせない
      if (feature === null) {
        return c.json(
          { ok: false, error: 'not_found' } as const,
          404,
          CACHE_HEADERS,
        );
      }
      return c.json({ feature }, 200, CACHE_HEADERS);
    },
  )
  .get('/health', async (c) => {
    const health = await getBrowserSupportHealth(Date.now());
    // 外形監視がいつも今の状態を読めるよう、ほかの読み取りと違って CDN に持たせない
    return c.json(health, health.status === 'ok' ? 200 : 503, {
      'Cache-Control': 'no-store',
    });
  });
