import { z } from 'zod';
import { getBlogContent } from '#api/blog';
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
