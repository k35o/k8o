import { OgImage } from '@/app/_components/og-image';

export const runtime = 'edge';

export const alt = 'Playgrounds';
export const size = {
  width: 1200,
  height: 600,
};

export const contentType = 'image/png';

export default function Image() {
  return OgImage({ title: 'Playgrounds' });
}
