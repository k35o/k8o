import linkCardMetadata from '@content/link-card-metadata.json';
import type { OgMetadata } from '@repo/helpers/og/og-metadata';
import type { FC } from 'react';

import type { LinkCardVariant } from './fallback';
import { LinkCardView } from './link-card-view';

const metadataByHref: Readonly<Record<string, Partial<OgMetadata>>> =
  linkCardMetadata;

export const LinkCard: FC<{
  href: string;
  variant?: LinkCardVariant;
}> = ({ href, variant = 'shadow' }) => (
  <LinkCardView
    href={href}
    metadata={metadataByHref[href] ?? {}}
    variant={variant}
  />
);
