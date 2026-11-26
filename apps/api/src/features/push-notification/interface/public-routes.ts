import { Hono } from 'hono';
import { validator } from 'hono/validator';
import * as z from 'zod/mini';

import { publicCacheControl } from '../../../shared/cache/public-cache-control';
import { validate } from '../../../shared/http/validate';
import { getPublicPushLogs } from '../application/public-push-logs';
import {
  rejectSubscription,
  subscribe,
  unsubscribe,
} from '../application/subscriptions';

const MAX_ENDPOINT_LENGTH = 2048;
const MAX_KEY_LENGTH = 256;

const endpointSchema = z
  .string()
  .check(z.minLength(1), z.maxLength(MAX_ENDPOINT_LENGTH));
const keySchema = z.string().check(z.minLength(1), z.maxLength(MAX_KEY_LENGTH));

const subscribeSchema = z.object({
  endpoint: endpointSchema,
  keys: z.object({ p256dh: keySchema, auth: keySchema }),
});

const unsubscribeSchema = z.object({
  endpoint: endpointSchema,
  auth: keySchema,
});

export const pushSubscriptionPublicRoutes = new Hono()
  .post(
    '/',
    validator('json', async (value, c) => {
      const parsed = subscribeSchema.safeParse(value);
      if (!parsed.success) {
        return c.json({ ok: false, error: 'invalid_request' } as const, 400);
      }
      const rejection = await rejectSubscription(parsed.data);
      if (rejection !== null) {
        return c.json({ ok: false, error: rejection } as const, 400);
      }
      return parsed.data;
    }),
    async (c) => {
      await subscribe(c.req.valid('json'));
      return c.body(null, 204);
    },
  )
  .delete('/', validate('json', unsubscribeSchema), async (c) => {
    const { endpoint, auth } = c.req.valid('json');
    await unsubscribe(endpoint, auth);
    return c.body(null, 204);
  });

export const pushLogPublicRoutes = new Hono().get('/', async (c) =>
  c.json(await getPublicPushLogs(), 200, {
    'Cache-Control': publicCacheControl({ maxAge: 60, sMaxAge: 600 }),
  }),
);
