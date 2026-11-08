import { isPlaygroundSection } from '@playgrounds/types';
import type { PlaygroundSection } from '@playgrounds/types';

// sections を静的に import すると、そのデモのクライアントの部品と CSS を、読んだページがすべて読むので、id ごとに遅れて読む
const modules = import.meta.glob<Record<string, unknown>>(
  '@playgrounds/*/index.ts',
);

const SECTION_FILE = /\/playgrounds\/([a-z0-9-]+)\/index\.ts$/u;

const loaders = new Map(
  Object.entries(modules).flatMap(([file, load]) => {
    const id = SECTION_FILE.exec(file)?.[1];
    return id === undefined ? [] : [[id, load] as const];
  }),
);

export const loadPlaygroundSection = async (
  id: string,
): Promise<PlaygroundSection | undefined> => {
  const load = loaders.get(id);
  return load === undefined
    ? undefined
    : Object.values(await load()).find(isPlaygroundSection);
};
