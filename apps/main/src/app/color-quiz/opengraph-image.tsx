import { OgImage } from '@/app/_components/og-image';

export const alt = 'color quiz';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function OpenGraphImage() {
  return OgImage({ title: 'color quiz' });
}
