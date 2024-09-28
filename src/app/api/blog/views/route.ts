import { incrementBlogView } from '#actions/blog';
import { z } from 'zod';

export async function POST(req: Request): Promise<Response> {
  const schema = z.object({
    blogId: z.number(),
  });
  const parsed = schema.parse(await req.json());
  const { blogId } = parsed;
  await incrementBlogView({ blogId });

  return new Response(null, { status: 204 });
}
