import { href } from '@k8ordo/framework';
import type { FC } from 'react';

import { loadPlaygroundSection } from '../load-section';
import { selectDemos } from './select-demos';

type Props = {
  sectionId: string;
  demo?: string | undefined;
};

export const PlaygroundEmbed: FC<Props> = async ({ sectionId, demo }) => {
  // 記事の部品の表は記事のページが静的に読むので、静的に import すると Playground の枠の CSS をデモの無い記事も読む
  const [section, { SectionDemos }] = await Promise.all([
    loadPlaygroundSection(sectionId),
    import('../section-demos'),
  ]);
  if (section === undefined) {
    throw new Error(`Playgroundセクションが見つかりません: ${sectionId}`);
  }
  return (
    <SectionDemos
      demos={selectDemos(section, demo)}
      href={href('/playgrounds/:id', { id: section.id })}
    />
  );
};
