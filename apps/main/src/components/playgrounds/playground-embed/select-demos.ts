import type { PlaygroundSection } from '@playgrounds/types';

export const selectDemos = (
  section: PlaygroundSection,
  demo: string | undefined,
): PlaygroundSection['demos'] => {
  const demos =
    demo === undefined
      ? section.demos
      : section.demos.filter(({ title }) => title === demo);
  if (demos.length === 0) {
    throw new Error(
      `Playgroundデモが見つかりません: ${section.id} / ${demo ?? ''}`,
    );
  }
  return demos;
};
