import * as z from 'zod/mini';
import { getBlogContent } from '@/app/blog/_api';
import { incrementBlogView } from '@/services/blogs/view';

export async function POST(req: Request): Promise<Response> {
  const schema = z.object({
    slug: z.string(),
  });
  const parsed = schema.parse(await req.json());
  const { slug } = parsed;
  const blog = await getBlogContent(slug);
  await incrementBlogView(blog.id);

  return new Response(null, { status: 204 });
}
