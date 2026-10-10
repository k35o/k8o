import { isAllowedPushEndpoint } from '@repo/helpers/push-endpoint';
import { Hono } from 'hono';
import { validator } from 'hono/validator';
import * as z from 'zod/mini';

import { isValidPushKeys } from '../application/push-keys';
import {
  deleteSubscription,
  insertSubscription,
} from '../infrastructure/subscription-repository';

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
    validator('json', (value, c) => {
      const parsed = subscribeSchema.safeParse(value);
      if (!parsed.success) {
        return c.json({ ok: false, error: 'invalid_request' } as const, 400);
      }
      // SSRF 対策: 通知を送る先は、Push サービスの https のホストに限る
      if (!isAllowedPushEndpoint(parsed.data.endpoint)) {
        return c.json(
          { ok: false, error: 'endpoint_not_allowed' } as const,
          400,
        );
      }
      if (!isValidPushKeys(parsed.data.keys.p256dh, parsed.data.keys.auth)) {
        return c.json({ ok: false, error: 'invalid_keys' } as const, 400);
      }
      return parsed.data;
    }),
    async (c) => {
      const { endpoint, keys } = c.req.valid('json');
      await insertSubscription({
        endpoint,
        endpointHost: new URL(endpoint).hostname,
        p256dh: keys.p256dh,
        auth: keys.auth,
      });
      return c.body(null, 204);
    },
  )
  .delete(
    '/',
    validator('json', (value, c) => {
      const parsed = unsubscribeSchema.safeParse(value);
      return parsed.success
        ? parsed.data
        : c.json({ ok: false, error: 'invalid_request' } as const, 400);
    }),
    async (c) => {
      const { endpoint, auth } = c.req.valid('json');
      await deleteSubscription(endpoint, auth);
      return c.body(null, 204);
    },
  );
