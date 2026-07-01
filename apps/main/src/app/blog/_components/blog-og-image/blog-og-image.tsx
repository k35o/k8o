import { OgImage } from '@/app/_components/og-image';
import {
  getBlogContent,
  getBlogOgCode,
} from '@/features/blog/interface/queries';

export const renderBlogOgImage = async (slug: string) => {
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
