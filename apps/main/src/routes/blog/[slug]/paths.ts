import type { Paths } from '@k8ordo/framework';

import { getBlogContents } from '@/features/blog/interface/queries';

const paths: Paths<'/blog/:slug'> = async () =>
  (await getBlogContents()).map(({ slug }) => slug);

export default paths;
