import { revalidateTag } from 'next/cache';
import * as z from 'zod/mini';

import { isAuthorizedRevalidateRequest } from '@/shared/auth/verify-revalidate-request';

const schema = z.object({
  tag: z.string().check(z.minLength(1), z.maxLength(256)),
});

export async function POST(req: Request): Promise<Response> {
  if (!isAuthorizedRevalidateRequest(req)) {
    return new Response(null, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return new Response(null, { status: 400 });
  }

  revalidateTag(parsed.data.tag, 'max');

  return new Response(null, { status: 204 });
}
