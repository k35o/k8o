import * as z from 'zod/mini';

import { incrementBlogView } from '@/features/blog/interface/commands';
import { getBlogContent } from '@/features/blog/interface/queries';

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

  const blog = await getBlogContent(parsed.data.slug);
  await incrementBlogView(blog.id);

  return new Response(null, { status: 204 });
}
