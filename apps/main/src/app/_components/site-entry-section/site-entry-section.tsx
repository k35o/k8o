import {
  BlogIcon,
  CodeXmlIcon,
  ColorContrastIcon,
  ColorInfoIcon,
  FlaskIcon,
  Heading,
  HorizontalWritingIcon,
  MixedColorIcon,
  NewsIcon,
  PackageIcon,
  PaletteIcon,
  ShieldCheckIcon,
  SlideIcon,
  SquircleIcon,
} from '@k8o/arte-odyssey';
import type { ReactNode } from 'react';

import {
  KIND_SECTION,
  siteEntries,
  type SiteEntryIcon,
  type SiteEntryKind,
} from '@/shared/site/site-entries';

import { AppCard } from '../app-card';

const ICON: Record<SiteEntryIcon, ReactNode> = {
  baseline: <ShieldCheckIcon size="md" />,
  colorConverter: <ColorInfoIcon size="md" />,
  contrastChecker: <ColorContrastIcon size="md" />,
  colorQuiz: <MixedColorIcon size="md" />,
  radiusMaker: <SquircleIcon size="md" />,
  mojiCount: <HorizontalWritingIcon size="md" />,
  htmlNest: <CodeXmlIcon size="md" />,
  fluida: <PaletteIcon size="md" />,
  blog: <BlogIcon size="md" />,
  talks: <SlideIcon size="md" />,
  playgrounds: <FlaskIcon size="md" />,
  artifacts: <PackageIcon size="md" />,
  readings: <NewsIcon size="md" />,
};

export const SiteEntrySection = ({ kind }: { kind: SiteEntryKind }) => {
  const section = KIND_SECTION[kind];
  const entries = siteEntries.filter((entry) => entry.kind === kind);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Heading type="h2">{section.title}</Heading>
        <p className="text-fg-mute text-sm">{section.description}</p>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <AppCard
            description={entry.description}
            icon={ICON[entry.icon]}
            key={entry.link}
            link={entry.link}
            title={entry.title}
          />
        ))}
      </div>
    </div>
  );
};
