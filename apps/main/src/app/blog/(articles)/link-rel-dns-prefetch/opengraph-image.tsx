import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = 'リソースへのリクエスト前にドメイン名を解決するdns-prefetch';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('link-rel-dns-prefetch');
}
