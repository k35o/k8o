import {
  BlogIcon,
  CodeXmlIcon,
  ColorContrastIcon,
  ColorInfoIcon,
  ColorScaleIcon,
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
} from '@k8ordo/ui';
import type { ReactNode } from 'react';

import { KIND_SECTION, siteEntries } from '@/shared/site/site-entries';
import type { SiteEntryIcon, SiteEntryKind } from '@/shared/site/site-entries';

import { AppCard } from '../app-card/app-card';

import styles from './site-entry-section.module.css';

const ICON: Record<SiteEntryIcon, ReactNode> = {
  browserSupport: <ShieldCheckIcon size="md" />,
  colorConverter: <ColorInfoIcon size="md" />,
  contrastChecker: <ColorContrastIcon size="md" />,
  colorQuiz: <MixedColorIcon size="md" />,
  radiusMaker: <SquircleIcon size="md" />,
  paletteMaker: <ColorScaleIcon size="md" />,
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
    <div className={styles.root}>
      <div>
        <Heading level="h2">{section.title}</Heading>
        <p className={styles.description}>{section.description}</p>
      </div>
      <div className={styles.entries}>
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
