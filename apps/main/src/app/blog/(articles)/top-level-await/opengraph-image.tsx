import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt =
  'Top-level awaitでモジュールの評価を非同期処理の完了まで待たせる';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('top-level-await');
}
