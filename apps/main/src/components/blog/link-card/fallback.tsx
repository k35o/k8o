import { Card } from '@k8ordo/ui';
import { ExternalLinkIcon } from '@k8ordo/ui/icons';
import type { FC } from 'react';

import styles from './fallback.module.css';

export type LinkCardVariant = 'shadow' | 'outline';

export const LinkCardFallback: FC<{
  href: string;
  variant?: LinkCardVariant;
}> = ({ href, variant = 'shadow' }) => (
  <div className={styles.root}>
    <Card interactive variant={variant}>
      <a
        className={styles.link}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        <p className={styles.title}>{href}</p>
        <div className={styles.host}>
          <ExternalLinkIcon size="sm" />
          <p>{new URL(href).hostname}</p>
        </div>
      </a>
    </Card>
  </div>
);
