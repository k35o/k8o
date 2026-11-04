import { ExternalLinkIcon, Card } from '@k8ordo/ui';
import type { FC } from 'react';

import styles from './fallback.module.css';

export type LinkCardVariant = 'shadow' | 'outline';

export const LinkCardFallback: FC<{
  href: string;
  variant?: LinkCardVariant;
}> = ({ href, variant = 'shadow' }) => (
  <div className={styles.root}>
    <Card interactive variant={variant}>
      {/* oxlint-disable-next-line jsx-a11y/control-has-associated-label -- リンクの名前は中の URL とホスト名の文字が持つ。規則は子を浅くしかたどらず、そこまで届かない */}
      <a
        className={styles.link}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        <div className={styles.body}>
          <p className={styles.title}>{href}</p>
          <div className={styles.host}>
            <ExternalLinkIcon size="sm" />
            <p>{new URL(href).hostname}</p>
          </div>
        </div>
      </a>
    </Card>
  </div>
);
