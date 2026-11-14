import { Heading, Stack } from '@k8ordo/ui';
import {
  BellIcon,
  BlendIcon,
  BookTextIcon,
  CodeIcon,
  ColorScaleIcon,
  ContrastIcon,
  FlaskIcon,
  PackageIcon,
  PaintBucketIcon,
  PaletteIcon,
  PresentationIcon,
  ShieldCheckIcon,
  SquircleIcon,
  TextHorizontalIcon,
} from '@k8ordo/ui/icons';
import type { ReactNode } from 'react';

import { KIND_SECTION, siteEntries } from '@/shared/site/site-entries';
import type { SiteEntryIcon, SiteEntryKind } from '@/shared/site/site-entries';

import { AppCard } from '../app-card/app-card';

import styles from './site-entry-section.module.css';

const ICON: Record<SiteEntryIcon, ReactNode> = {
  browserSupport: <ShieldCheckIcon size="md" />,
  colorConverter: <PaintBucketIcon size="md" />,
  contrastChecker: <ContrastIcon size="md" />,
  colorQuiz: <BlendIcon size="md" />,
  radiusMaker: <SquircleIcon size="md" />,
  paletteMaker: <ColorScaleIcon size="md" />,
  mojiCount: <TextHorizontalIcon size="md" />,
  htmlNest: <CodeIcon size="md" />,
  fluida: <PaletteIcon size="md" />,
  blog: <BookTextIcon size="md" />,
  talks: <PresentationIcon size="md" />,
  playgrounds: <FlaskIcon size="md" />,
  artifacts: <PackageIcon size="md" />,
  readings: <BellIcon size="md" />,
};

export const SiteEntrySection = ({ kind }: { kind: SiteEntryKind }) => {
  const section = KIND_SECTION[kind];
  const entries = siteEntries.filter((entry) => entry.kind === kind);

  return (
    <Stack gap="lg">
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
    </Stack>
  );
};
