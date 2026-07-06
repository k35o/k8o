import * as z from 'zod/mini';

import { incrementBlogView } from '@/features/blog/interface/commands';
import { findPublishedBlogId } from '@/features/blog/interface/queries';

const schema = z.object({
  slug: z.string().check(z.minLength(1), z.maxLength(200)),
});

export async function POST(req: Request): Promise<Response> {
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

  const blogId = await findPublishedBlogId(parsed.data.slug);
  if (blogId === null) {
    return new Response(null, { status: 404 });
  }

  await incrementBlogView(blogId);

  return new Response(null, { status: 204 });
}
