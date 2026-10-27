import { Card, ChevronIcon, ExternalLinkIcon, Heading } from '@k8ordo/ui';
import type { ReactNode } from 'react';

import styles from './app-card.module.css';

export const AppCard = ({
  link,
  title,
  description,
  icon,
}: {
  link: `/${string}` | `https://${string}`;
  title: string;
  description: string;
  icon?: ReactNode | undefined;
}) => {
  const isExternal = link.startsWith('https://');

  const content = (
    <div className={styles.root}>
      <div className={styles.header}>
        {icon === undefined ? null : (
          <span className={styles.icon}>{icon}</span>
        )}
        <Heading level="h3">{title}</Heading>
      </div>

      <p className={styles.description}>{description}</p>

      <div className={styles.footer}>
        <span className={styles.arrow}>
          {isExternal ? (
            <ExternalLinkIcon size="sm" />
          ) : (
            <ChevronIcon direction="right" size="sm" />
          )}
        </span>
      </div>
    </div>
  );

  return (
    <Card variant="shadow" interactive>
      {isExternal ? (
        <a
          className={styles.link}
          href={link}
          rel="noopener noreferrer"
          target="_blank"
        >
          {content}
        </a>
      ) : (
        <a className={styles.link} href={link}>
          {content}
        </a>
      )}
    </Card>
  );
};
