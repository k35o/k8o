import { incrementBlogView } from '#services/blog';
import { z } from 'zod/v4';

export async function POST(req: Request): Promise<Response> {
  const schema = z.object({
    slug: z.string(),
  });
  const parsed = schema.parse(await req.json());
  const { slug } = parsed;
  await incrementBlogView(slug);

  return new Response(null, { status: 204 });
}
