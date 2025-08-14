import { getBlogContent } from '#api/blog';
import { OgImage } from '@/app/_components/og-image';

export const alt =
  'OIDCを利用したnpmパッケージの公開が可能になったので、Changeset×GitHub Actionsで試してみる';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('npm-trusted-publishing-for-npm-packages');

  return OgImage({
    title: blog.title,
  });
}
