import { OgImage } from '@/app/_components/og-image';

export const alt = 'talks';
export const size = {
  width: 1200,
  height: 600,
};

export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return await OgImage({ title: 'talks' });
}
