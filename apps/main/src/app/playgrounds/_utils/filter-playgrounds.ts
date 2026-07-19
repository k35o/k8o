import { playgroundCategoryLabels } from '@/app/_components/playgrounds/types';
import { matchesSearchQuery } from '@/shared/search/search-filter';

import type { PlaygroundSummary } from './types';

export const filterPlaygrounds = (
  playgrounds: readonly PlaygroundSummary[],
  query: string,
): PlaygroundSummary[] =>
  playgrounds.filter((playground) =>
    matchesSearchQuery(query, [
      playground.title,
      playground.description,
      playgroundCategoryLabels[playground.category],
      ...playground.demoTexts,
    ]),
  );
