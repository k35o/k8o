import { db } from '@repo/database';
import * as z from 'zod/mini';

const MAX_BODY_SIZE = 64 * 1024; // 64KB

const ALLOWED_ORIGINS =
  process.env['VERCEL_ENV'] === 'production'
    ? new Set(['https://k8o.me', 'https://www.k8o.me'])
    : null;

const reportSchema = z.array(
  z.object({
    type: z.string(),
    age: z.number(),
    url: z.string(),
    user_agent: z.string(),
    body: z.record(z.string(), z.unknown()),
  }),
);

export async function POST(req: Request): Promise<Response> {
  if (ALLOWED_ORIGINS) {
    const origin = req.headers.get('origin');
    if (!(origin && ALLOWED_ORIGINS.has(origin))) {
      return new Response(null, { status: 403 });
    }
  }

  const contentLength = req.headers.get('content-length');
  if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
    return new Response(null, { status: 413 });
  }

  const text = await req.text();
  if (text.length > MAX_BODY_SIZE) {
    return new Response(null, { status: 413 });
  }

  const parsed = reportSchema.safeParse(JSON.parse(text));
  if (!parsed.success) {
    return new Response(null, { status: 400 });
  }

  const values = parsed.data.map((report) => ({
    type: report.type,
    url: report.url,
    body: report.body,
  }));

  if (values.length === 0) {
    return new Response(null, { status: 204 });
  }

  await db.insert(db._schema.reportingReports).values(values);

  return new Response(null, { status: 204 });
}
