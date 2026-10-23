import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';
import {
  findBlogContent,
  getBlogContents,
} from '@/features/blog/interface/queries';

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const blogs = await getBlogContents();
  return blogs.map((blog) => ({ slug: blog.slug }));
}

export async function GET(
  _request: Request,
  { params }: RouteContext<'/blog/[slug]/og.png'>,
): Promise<Response> {
  const { slug } = await params;
  if ((await findBlogContent(slug)) === null) {
    return new Response('Not Found', { status: 404 });
  }
  return renderBlogOgImage(slug);
}
