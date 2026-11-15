import type { Paths } from '@k8ordo/framework';

import { getSlideContents } from '@/features/slides/interface/queries';

const paths: Paths<'/slides/:slug'> = async () =>
  (await getSlideContents()).map(({ slug }) => slug);

export default paths;
