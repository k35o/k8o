import { getBlogContent } from '#api/blog';
import { OgImage } from '@/app/_components/og-image';

export const alt = 'リソースへのリクエスト前にドメイン名を解決するdns-prefetch';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('link-rel-dns-prefetch');

  return OgImage({
    title: blog.title,
  });
}
