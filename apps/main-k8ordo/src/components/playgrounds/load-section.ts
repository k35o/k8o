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

// <id>/index.ts の export は 1 つで、名前がセクションごとに違うので、glob の import で名指せない
const isSection = (value: unknown): value is PlaygroundSection =>
  typeof value === 'object' && value !== null && 'demos' in value;

export const loadPlaygroundSection = async (
  id: string,
): Promise<PlaygroundSection | undefined> => {
  const load = loaders.get(id);
  return load === undefined
    ? undefined
    : Object.values(await load()).find(isSection);
};
