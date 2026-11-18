import type { Paths } from '@k8ordo/framework';

import { getTalkDecks } from '@/features/talks/interface/queries';

const paths: Paths<'/talks/:slug'> = async () =>
  (await getTalkDecks()).map(({ deck }) => deck.slug);

export default paths;
