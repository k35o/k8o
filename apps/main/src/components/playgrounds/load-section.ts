import { isPlaygroundSection } from '@playgrounds/types';
import type { PlaygroundSection } from '@playgrounds/types';

import { loadersBySlug } from '@/shared/glob/loaders-by-slug';

// sections を静的に import すると、そのデモのクライアントの部品と CSS を、読んだページがすべて読むので、id ごとに遅れて読む
const modules = import.meta.glob<Record<string, unknown>>(
  '@playgrounds/*/index.ts',
);

const loaders = loadersBySlug(
  modules,
  /\/playgrounds\/([a-z0-9-]+)\/index\.ts$/u,
);

export const loadPlaygroundSection = async (
  id: string,
): Promise<PlaygroundSection | undefined> => {
  const load = loaders.get(id);
  return load === undefined
    ? undefined
    : Object.values(await load()).find(isPlaygroundSection);
};

// デモの id は、src/playgrounds の下の index.ts を持つディレクトリの名前
export const playgroundSectionIds: string[] = [...loaders.keys()];
