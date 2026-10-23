import { ExternalLinkIcon, Card } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import type { OgMetadata } from '@repo/helpers/og/og-metadata';
import type { FC } from 'react';

import { LinkCardFallback } from './fallback';
import type { LinkCardVariant } from './fallback';
import { MetaImage } from './image';

import styles from './link-card-view.module.css';

export const LinkCardView: FC<{
  href: string;
  metadata: Partial<OgMetadata>;
  variant?: LinkCardVariant;
}> = ({ href, metadata, variant = 'shadow' }) => {
  if (
    metadata.title === undefined &&
    metadata.description === undefined &&
    metadata.imageUrl === undefined
  ) {
    return <LinkCardFallback variant={variant} href={href} />;
  }

  return (
    <div className={styles.root}>
      <Card interactive variant={variant}>
        <a
          className={styles.link}
          href={href}
          rel="noopener noreferrer"
          target="_blank"
        >
          <div className={styles.body}>
            {metadata.imageUrl !== undefined && (
              <MetaImage src={metadata.imageUrl} />
            )}
            <div className={styles.text}>
              {metadata.title !== undefined && (
                <div className={styles.heading}>
                  <p className={cn(styles.clamp, styles.title)}>
                    {metadata.title}
                  </p>
                  {metadata.description !== undefined && (
                    <p className={cn(styles.clamp, styles.description)}>
                      {metadata.description}
                    </p>
                  )}
                </div>
              )}
              <div className={styles.footer}>
                <div className={styles.footerItem}>
                  <ExternalLinkIcon size="sm" />
                  <p>{new URL(href).hostname}</p>
                </div>
              </div>
            </div>
          </div>
        </a>
      </Card>
    </div>
  );
};
