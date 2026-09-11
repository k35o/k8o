import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = ':playingと:pausedでメディアの再生状態にCSSを追従させる';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('media-pseudos');
}
