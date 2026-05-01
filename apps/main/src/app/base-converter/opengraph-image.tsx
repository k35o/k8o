import { OgImage } from '@/app/_components/og-image';

export const alt = '基数チェンジャー';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return OgImage({ title: '基数チェンジャー' });
}
