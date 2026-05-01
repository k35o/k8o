import * as z from 'zod/mini';

import { createReports } from '@/features/reports/application/report';

// 64KB
const MAX_BODY_SIZE = 64 * 1024;

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
  if (ALLOWED_ORIGINS !== null) {
    const origin = req.headers.get('origin');
    if (origin === null || !ALLOWED_ORIGINS.has(origin)) {
      return new Response(null, { status: 403 });
    }
  }

  const contentLength = req.headers.get('content-length');
  if (contentLength !== null && Number(contentLength) > MAX_BODY_SIZE) {
    return new Response(null, { status: 413 });
  }

  const text = await req.text();
  if (text.length > MAX_BODY_SIZE) {
    return new Response(null, { status: 413 });
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }

  const parsed = reportSchema.safeParse(json);
  if (!parsed.success) {
    return new Response(null, { status: 400 });
  }

  const values = parsed.data.map((report) => ({
    type: report.type,
    url: report.url,
    body: report.body,
  }));

  await createReports(values);

  return new Response(null, { status: 204 });
}
