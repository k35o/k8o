import { OgImage } from '@/app/_components/og-image';
import {
  getBlogContent,
  getBlogOgCode,
} from '@/features/blog/interface/queries';

export const alt =
  'OIDCを利用したnpmパッケージの公開が可能になったので、Changeset×GitHub Actionsで試してみる';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const [blog, ogCode] = await Promise.all([
    getBlogContent('npm-trusted-publishing-for-npm-packages'),
    getBlogOgCode('npm-trusted-publishing-for-npm-packages'),
  ]);

  return OgImage({
    category: 'Blog',
    title: blog.title,
    code: ogCode ?? undefined,
  });
}
