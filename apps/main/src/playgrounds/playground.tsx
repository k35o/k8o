import { ExternalLinkIcon, FlaskIcon } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import type { FC, PropsWithChildren } from 'react';

import styles from './playground.module.css';

type Props = PropsWithChildren<{
  title: string;
  description?: string | undefined;
  href?: string | undefined;
}>;

export const Playground: FC<Props> = ({
  title,
  description,
  href,
  children,
}) => (
  <section className={styles.root}>
    <div className={cn('writing-h', styles.frame)}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.badge}>
            <FlaskIcon size="sm" />
            Playground
          </span>
          <h3 className={styles.title}>{title}</h3>
          {href !== undefined && (
            <a
              aria-label={`Playgroundページで開く: ${href}`}
              className={styles.link}
              href={href}
            >
              <span className={styles.shortHref}>{href.split('/').at(-1)}</span>
              <span className={styles.fullHref}>{href}</span>
              <span className={styles.linkIcon}>
                <ExternalLinkIcon size="sm" />
              </span>
            </a>
          )}
        </div>
        {description !== undefined && (
          <p className={styles.description}>{description}</p>
        )}
      </header>
      <div className={styles.body}>{children}</div>
    </div>
  </section>
);
