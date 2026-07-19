import { Anchor } from '@k8o/arte-odyssey';
import type { Route } from 'next';
import Link from 'next/link';
import type { FC } from 'react';

import { Playground } from './playground';
import { playgroundSections } from './sections';

type Props = {
  sectionId: string;
  demo?: string | undefined;
};

export const PlaygroundEmbed: FC<Props> = ({ sectionId, demo }) => {
  const section = playgroundSections.find((s) => s.id === sectionId);
  if (section === undefined) {
    throw new Error(`Playgroundセクションが見つかりません: ${sectionId}`);
  }

  const demos =
    demo === undefined
      ? section.demos
      : section.demos.filter((d) => d.title === demo);
  if (demos.length === 0) {
    throw new Error(
      `Playgroundデモが見つかりません: ${sectionId} / ${demo ?? ''}`,
    );
  }

  return (
    <>
      {demos.map((sectionDemo) => {
        const DemoComponent = sectionDemo.component;
        return (
          <Playground
            description={sectionDemo.description}
            key={sectionDemo.title}
            title={sectionDemo.title}
          >
            <DemoComponent />
            <div className="mt-6 flex justify-end text-sm">
              <Anchor
                href={`/playgrounds/${section.id}` as Route}
                renderAnchor={({ className, href, children }) => (
                  <Link className={className} href={href}>
                    {children}
                  </Link>
                )}
              >
                Playgroundページで開く
              </Anchor>
            </div>
          </Playground>
        );
      })}
    </>
  );
};
