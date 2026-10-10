import { Hono } from 'hono';
import { validator } from 'hono/validator';
import * as z from 'zod/mini';

import { countBlogView } from '../application/count-view';
import { submitBlogFeedback } from '../application/submit-feedback';

const slugParamSchema = z.object({
  slug: z.string().check(z.minLength(1), z.maxLength(200)),
});

// 画面が送るのは「良い（1）」と「悪い（2）」だけ
const feedbackSchema = z.object({
  feedbackId: z.nullable(z.union([z.literal(1), z.literal(2)])),
  comment: z.string().check(z.maxLength(500)),
});

const validateSlug = validator('param', (value, c) => {
  const parsed = slugParamSchema.safeParse(value);
  return parsed.success
    ? parsed.data
    : c.json({ ok: false, error: 'invalid_request' } as const, 400);
});

export const blogPublicRoutes = new Hono()
  .post('/:slug/views', validateSlug, async (c) => {
    const result = await countBlogView(c.req.valid('param').slug);
    if (result === 'not_found') {
      return c.json({ ok: false, error: 'not_found' } as const, 404);
    }
    return c.body(null, 204);
  })
  .post(
    '/:slug/feedback',
    validateSlug,
    validator('json', (value, c) => {
      const parsed = feedbackSchema.safeParse(value);
      // 評価もコメントも無いフィードバックは受け付けない
      return parsed.success &&
        (parsed.data.feedbackId !== null || parsed.data.comment !== '')
        ? parsed.data
        : c.json({ ok: false, error: 'invalid_request' } as const, 400);
    }),
    async (c) => {
      const result = await submitBlogFeedback(
        c.req.valid('param').slug,
        c.req.valid('json'),
      );
      if (result === 'not_found') {
        return c.json({ ok: false, error: 'not_found' } as const, 404);
      }
      return c.body(null, 204);
    },
  );
