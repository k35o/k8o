import type { Paths } from '@k8ordo/framework';

import { getTags } from '@/features/tags/interface/queries';

const paths: Paths<'/tags/:id'> = async () =>
  (await getTags()).map(({ id }) => id.toString());

export default paths;
