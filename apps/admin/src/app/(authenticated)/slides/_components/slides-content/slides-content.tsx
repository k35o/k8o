import { getSlides } from '@/features/slides/interface/queries';
import { verifySession } from '@/shared/auth/verify-session';

import { SlideTable } from '../slide-table';

export const SlidesContent = async () => {
  await verifySession();
  const slides = await getSlides();

  return <SlideTable slides={slides} />;
};
