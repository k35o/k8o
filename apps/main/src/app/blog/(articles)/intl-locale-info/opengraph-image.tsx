import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = 'ロケール固有の情報を取得するIntl.Locale info';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('intl-locale-info');
}
