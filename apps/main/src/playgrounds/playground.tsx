import { ExternalLinkIcon, FlaskIcon } from '@k8ordo/ui/icons';
import { cn } from '@repo/helpers/cn';
import type { FC, PropsWithChildren } from 'react';

import { DemoHeadingProvider } from './demo-heading';

import styles from './playground.module.css';

export type PlaygroundHeadingLevel = 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

type Props = PropsWithChildren<{
  title: string;
  headingLevel?: PlaygroundHeadingLevel | undefined;
  description?: string | undefined;
  href?: string | undefined;
}>;

export const Playground: FC<Props> = ({
  title,
  headingLevel = 'h2',
  description,
  href,
  children,
}) => {
  const Title = headingLevel;

  return (
    <section className={styles.root}>
      <div className={cn('writing-h', styles.frame)}>
        <header className={styles.header}>
          <div className={styles.titleRow}>
            <span className={styles.badge}>
              <FlaskIcon size="sm" />
              Playground
            </span>
            <Title className={styles.title}>{title}</Title>
            {href !== undefined && (
              <a
                aria-label={`Playgroundページで開く: ${href}`}
                className={styles.link}
                href={href}
              >
                <span className={styles.shortHref}>
                  {href.split('/').at(-1)}
                </span>
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
        <div className={styles.body}>
          <DemoHeadingProvider playgroundHeadingLevel={headingLevel}>
            {children}
          </DemoHeadingProvider>
        </div>
      </div>
    </section>
  );
};
