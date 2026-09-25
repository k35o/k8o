import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = 'ReadableStreamをfor await...ofで読む';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('async-iterable-streams');
}
