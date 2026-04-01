import {
  Anchor,
  ExternalLinkIcon,
  InteractiveCard,
  PublishDateIcon,
} from '@k8o/arte-odyssey';
import { formatDate } from '@repo/helpers/date/format';
import { type FC, Suspense } from 'react';
import { LinkCardErrorBoundary } from './error-boundary';
import { MetaImage } from './image';
import { getMetadata } from './metadata';

export const LinkCardLoading: FC<{ href: string }> = ({ href }) => {
  return (
    <InteractiveCard>
      <a href={href} rel="noopener noreferrer" target="_blank">
        <div className="flex animate-pulse flex-col overflow-hidden sm:flex-row">
          <div className="w-full rounded-t-lg bg-bg-mute sm:w-48 sm:shrink-0 sm:rounded-t-none sm:rounded-l-lg">
            <div className="aspect-video w-full bg-bg-mute" />
          </div>
          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="h-5 w-3/4 rounded-md bg-bg-mute" />
            <div className="h-4 w-full rounded-md bg-bg-mute" />
            <div className="mt-auto h-3 w-1/3 rounded-md bg-bg-mute" />
          </div>
        </div>
      </a>
    </InteractiveCard>
  );
};

const Content: FC<{
  href: string;
  publishedAt?: Date | string | undefined;
}> = async ({ href, publishedAt }) => {
  const metaData = await getMetadata(href);

  if (!(metaData.title || metaData.description || metaData.image)) {
    return <Anchor href={href}>{href}</Anchor>;
  }

  return (
    <InteractiveCard>
      <a
        className="group block h-full"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        <div className="flex h-full flex-col overflow-hidden sm:flex-row">
          {metaData.image && <MetaImage src={metaData.image} />}
          <div className="flex flex-1 flex-col gap-2 p-4">
            {metaData.title && (
              <div className="flex flex-col gap-1 transition-colors duration-200 ease-out group-hover:text-primary-fg">
                <p className="line-clamp-2 font-bold text-md">
                  {metaData.title}
                </p>
                {metaData.description && (
                  <p className="line-clamp-2 text-fg-mute text-sm">
                    {metaData.description}
                  </p>
                )}
              </div>
            )}
            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 text-fg-subtle text-xs">
              {publishedAt && (
                <div className="flex items-center gap-1">
                  <PublishDateIcon size="sm" />
                  <span>
                    {formatDate(new Date(publishedAt), 'yyyy年M月d日')}
                  </span>
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
    </InteractiveCard>
  );
};

export const LinkCard: FC<{
  href: string;
  publishedAt?: Date | string | undefined;
}> = ({ href, publishedAt }) => {
  return (
    <LinkCardErrorBoundary href={href}>
      <Suspense fallback={<LinkCardLoading href={href} />}>
        <Content href={href} publishedAt={publishedAt} />
      </Suspense>
    </LinkCardErrorBoundary>
  );
};
