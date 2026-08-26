import { verifySession } from '@repo/auth-shell/verify-session';

import { getSlides } from '@/features/slides/interface/queries';

import { SlideTable } from '../slide-table';

export const SlidesContent = async () => {
  await verifySession();
  const slides = await getSlides();

  return <SlideTable slides={slides} />;
};
