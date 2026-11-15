import type { Paths } from '@k8ordo/framework';

import { getBlogDemoNames } from '@/features/blog/interface/queries';

const paths: Paths<'/blog/:slug/demos/:demo'> = async ({ slug }) =>
  getBlogDemoNames(slug);

export default paths;
