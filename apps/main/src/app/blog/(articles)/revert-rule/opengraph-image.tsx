import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = 'revert-ruleでルール1つ分だけカスケードを巻き戻す';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('revert-rule');
}
