import { OgImage } from '@/app/_components/og-image';

export const runtime = 'edge';

export const alt = 'k8o';
export const size = {
  width: 1200,
  height: 600,
};

export const contentType = 'image/png';

export default function OpenGraphImage() {
  return OgImage({ title: 'k8o' });
}
