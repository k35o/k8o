import { OgImage } from '@/components/site/og-image/og-image';
import {
  getBlogContent,
  getBlogOgCode,
} from '@/features/blog/interface/queries';

export const renderBlogOgImage = async (slug: string): Promise<Response> => {
  const [blog, ogCode] = await Promise.all([
    getBlogContent(slug),
    getBlogOgCode(slug),
  ]);

  return OgImage({
    category: 'Blog',
    title: blog.title,
    code: ogCode ?? undefined,
  });
};
