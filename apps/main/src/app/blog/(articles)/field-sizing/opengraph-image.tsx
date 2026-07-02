import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt =
  'field-sizingでフォームコントロールを内容に合わせて伸縮させる';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('field-sizing');
}
