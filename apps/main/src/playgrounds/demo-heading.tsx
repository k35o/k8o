'use client';

import { createContext, use } from 'react';
import type { FC, ReactNode } from 'react';

import type { PlaygroundHeadingLevel } from './playground';

type DemoHeadingLevel = 'h3' | 'h4' | 'h5' | 'h6';

// h7 は無いので、h6 の Playground の中の見出しは同じ h6 に置く
const demoHeadingLevels = {
  h2: 'h3',
  h3: 'h4',
  h4: 'h5',
  h5: 'h6',
  h6: 'h6',
} as const satisfies Record<PlaygroundHeadingLevel, DemoHeadingLevel>;

const DemoHeadingContext = createContext<DemoHeadingLevel>(
  demoHeadingLevels.h2,
);

export const DemoHeadingProvider: FC<{
  playgroundHeadingLevel: PlaygroundHeadingLevel;
  children: ReactNode;
}> = ({ playgroundHeadingLevel, children }) => (
  <DemoHeadingContext value={demoHeadingLevels[playgroundHeadingLevel]}>
    {children}
  </DemoHeadingContext>
);

export const useDemoHeading = (): DemoHeadingLevel => use(DemoHeadingContext);
