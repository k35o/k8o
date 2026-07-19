import { OgImage } from '@/app/_components/og-image';
import { getPlaygroundSection } from '@/app/_components/playgrounds';

export const alt = 'Playgrounds';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const section = getPlaygroundSection(id);

  return OgImage({
    title: section?.title ?? 'Playgrounds',
    category: 'Playground',
  });
}
