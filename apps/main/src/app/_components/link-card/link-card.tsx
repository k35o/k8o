import { Anchor, ExternalLinkIcon, PublishDateIcon } from '@k8o/arte-odyssey';
import { cn } from '@repo/helpers/cn';
import { formatDate } from '@repo/helpers/date/format';
import { type FC, Suspense } from 'react';
import { LinkCardErrorBoundary } from './error-boundary';
import { MetaImage } from './image';
import { getMetadata } from './metadata';

type Variant = 'horizontal' | 'vertical';

const Loading: FC<{ href: string; variant: Variant }> = ({ href, variant }) => {
  return (
    <a href={href} rel="noopener noreferrer" target="_blank">
      <div
        className={cn(
          'flex animate-pulse flex-col gap-4 rounded-md border border-border-base bg-bg-base/90',
          variant === 'horizontal' && 'sm:flex-row',
        )}
      >
        <div
          className={cn(
            'w-full rounded-t-sm bg-bg-mute',
            variant === 'vertical'
              ? 'aspect-2/1'
              : 'h-40 sm:h-auto sm:w-1/3 sm:max-w-56 sm:rounded-t-none sm:rounded-l-sm',
          )}
        />
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex animate-pulse flex-col gap-1">
            <p className="font-bold text-md md:text-lg">Loading...</p>
            <p className="text-fg-mute text-xs md:text-sm">Loading...</p>
          </div>
          <div className="mt-auto flex items-center gap-1 text-fg-mute">
            <ExternalLinkIcon size="sm" />
            <p className="text-xs">{new URL(href).hostname}</p>
          </div>
        </div>
      </div>
    </a>
  );
};

const Content: FC<{
  href: string;
  variant: Variant;
  publishedAt?: Date | string | undefined;
}> = async ({ href, variant, publishedAt }) => {
  const metaData = await getMetadata(href);

  if (!(metaData.title || metaData.description || metaData.image)) {
    return <Anchor href={href}>{href}</Anchor>;
  }

  return (
    <a
      className="block h-full"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <div
        className={cn(
          'flex h-full flex-col rounded-md border border-border-base bg-bg-base/90',
          variant === 'horizontal' && 'sm:flex-row',
        )}
      >
        {metaData.image && <MetaImage src={metaData.image} variant={variant} />}
        <div className="flex flex-1 flex-col gap-3 p-4">
          {metaData.title && (
            <div className="flex flex-col gap-1">
              {metaData.title && (
                <p className="font-bold text-md md:text-lg">{metaData.title}</p>
              )}
              {metaData.description && (
                <p className="line-clamp-2 text-fg-mute text-xs md:text-sm">
                  {metaData.description}
                </p>
              )}
            </div>
          )}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 text-fg-mute text-xs">
            {publishedAt && (
              <div className="flex items-center gap-1">
                <PublishDateIcon size="sm" />
                <span>{formatDate(new Date(publishedAt), 'yyyy年M月d日')}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <ExternalLinkIcon size="sm" />
              <p>{new URL(href).hostname}</p>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
};

export const LinkCard: FC<{
  href: string;
  publishedAt?: Date | string | undefined;
  variant?: Variant;
}> = ({ href, publishedAt, variant = 'horizontal' }) => {
  return (
    <LinkCardErrorBoundary href={href}>
      <Suspense fallback={<Loading href={href} variant={variant} />}>
        <Content href={href} publishedAt={publishedAt} variant={variant} />
      </Suspense>
    </LinkCardErrorBoundary>
  );
};
