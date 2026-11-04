import { Playground } from '@playgrounds/playground';
import type { PlaygroundHeadingLevel } from '@playgrounds/playground';
import type { PlaygroundSection } from '@playgrounds/types';
import type { FC } from 'react';

export const SectionDemos: FC<{
  demos: PlaygroundSection['demos'];
  headingLevel?: PlaygroundHeadingLevel | undefined;
  href?: string | undefined;
}> = ({ demos, headingLevel, href }) => (
  <>
    {demos.map(({ component: Demo, title, description }) => (
      <Playground
        description={description}
        headingLevel={headingLevel}
        href={href}
        key={title}
        title={title}
      >
        <Demo />
      </Playground>
    ))}
  </>
);
