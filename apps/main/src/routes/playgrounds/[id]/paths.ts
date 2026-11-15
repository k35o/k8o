import type { Paths } from '@k8ordo/framework';

import { playgroundSectionIds } from '@/components/playgrounds/load-section';

const paths: Paths<'/playgrounds/:id'> = () => playgroundSectionIds;

export default paths;
