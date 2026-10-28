import { Playground } from '@playgrounds/playground';
import type { PlaygroundSection } from '@playgrounds/types';
import type { FC } from 'react';

export const SectionDemos: FC<{
  demos: PlaygroundSection['demos'];
  href?: string | undefined;
}> = ({ demos, href }) => (
  <>
    {demos.map(({ component: Demo, title, description }) => (
      <Playground
        description={description}
        href={href}
        key={title}
        title={title}
      >
        <Demo />
      </Playground>
    ))}
  </>
);
