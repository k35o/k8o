import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt =
  'OIDCを利用したnpmパッケージの公開が可能になったので、Changeset×GitHub Actionsで試してみる';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('npm-trusted-publishing-for-npm-packages');
}
