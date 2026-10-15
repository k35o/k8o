import { ExternalLinkIcon, Card, PublishDateIcon } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import { formatDate } from '@repo/helpers/date/format';
import { Suspense } from 'react';
import type { FC } from 'react';

import { LinkCardErrorBoundary } from './error-boundary';
import { LinkCardFallback } from './fallback';
import type { LinkCardVariant } from './fallback';
import { MetaImage } from './image';
import { getMetadata } from './metadata';

import styles from './link-card.module.css';

const LinkCardLoading: FC<{
  href: string;
  variant?: LinkCardVariant;
}> = ({ href, variant = 'shadow' }) => (
  <div className={styles.root}>
    <Card interactive variant={variant}>
      <a
        aria-label={`${href}（読み込み中）`}
        className={styles.loadingLink}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        <div className={styles.loadingBody}>
          <div className={styles.loadingImage}>
            <div className={styles.loadingImageFrame} />
          </div>
          <div className={styles.loadingText}>
            <div className={cn(styles.bone, styles.boneTitle)} />
            <div className={cn(styles.bone, styles.boneDescription)} />
            <div className={cn(styles.bone, styles.boneHost)} />
          </div>
        </div>
      </a>
    </Card>
  </div>
);

const Content: FC<{
  href: string;
  publishedAt?: Date | string | undefined;
  variant?: LinkCardVariant;
}> = async ({ href, publishedAt, variant = 'shadow' }) => {
  let metaData;
  try {
    metaData = await getMetadata(href);
  } catch {
    return <LinkCardFallback variant={variant} href={href} />;
  }

  if (
    metaData.title === undefined &&
    metaData.description === undefined &&
    metaData.imageUrl === undefined
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
            {metaData.imageUrl !== undefined && (
              <MetaImage src={metaData.imageUrl} />
            )}
            <div className={styles.text}>
              {metaData.title !== undefined && (
                <div className={styles.heading}>
                  <p className={cn(styles.clamp, styles.title)}>
                    {metaData.title}
                  </p>
                  {metaData.description !== undefined && (
                    <p className={cn(styles.clamp, styles.description)}>
                      {metaData.description}
                    </p>
                  )}
                </div>
              )}
              <div className={styles.footer}>
                {publishedAt !== undefined && (
                  <div className={styles.footerItem}>
                    <PublishDateIcon size="sm" />
                    <span>
                      {formatDate(new Date(publishedAt), 'yyyy年M月d日')}
                    </span>
                  </div>
                )}
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

export const LinkCard: FC<{
  href: string;
  publishedAt?: Date | string | undefined;
  variant?: LinkCardVariant;
}> = ({ href, publishedAt, variant = 'shadow' }) => (
  <LinkCardErrorBoundary variant={variant} href={href}>
    <Suspense fallback={<LinkCardLoading variant={variant} href={href} />}>
      <Content variant={variant} href={href} publishedAt={publishedAt} />
    </Suspense>
  </LinkCardErrorBoundary>
);
