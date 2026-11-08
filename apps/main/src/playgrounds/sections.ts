import { isPlaygroundSection } from './types';
import type { PlaygroundSection } from './types';

const modules = import.meta.glob<Record<string, unknown>>('./*/index.ts', {
  eager: true,
});

// ディレクトリの名前の順
export const playgroundSections: PlaygroundSection[] = Object.values(
  modules,
).flatMap((module) => Object.values(module).filter(isPlaygroundSection));
