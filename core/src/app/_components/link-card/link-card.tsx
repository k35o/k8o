import { MetaImage } from './image';
import { getMetadata } from '#link-card/metadata';
import { Anchor } from '@k8o/components/anchor';
import { ErrorBoundary } from '@k8o/components/error-boundary';
import { ExternalLinkIcon } from '@k8o/components/icons';
import { FC, Suspense } from 'react';

const Loading: FC<{ href: string }> = ({ href }) => {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <div className="bg-bg-base/90 border-border-base flex animate-pulse flex-col gap-4 rounded-md border sm:flex-row">
        <div className="bg-bg-mute h-40 w-full rounded-l-sm sm:h-auto sm:w-1/3 sm:max-w-56" />
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex animate-pulse flex-col gap-1">
            <p className="text-md font-bold md:text-lg">Loading...</p>
            <p className="text-fg-mute text-xs md:text-sm">
              Loading...
            </p>
          </div>
          <div className="text-fg-mute flex items-center gap-1">
            <ExternalLinkIcon size="sm" />
            <p className="text-xs">{new URL(href).hostname}</p>
          </div>
        </div>
      </div>
    </a>
  );
};

const Content: FC<{ href: string }> = async ({ href }) => {
  const metaData = await getMetadata(href);

  if (!metaData.title && !metaData.description && !metaData.image) {
    return <Anchor href={href}>{href}</Anchor>;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <div className="bg-bg-base/90 border-border-base flex flex-col gap-4 rounded-md border sm:flex-row">
        {metaData.image && <MetaImage src={metaData.image} />}
        <div className="flex flex-1 flex-col gap-3 p-4">
          {metaData.title && (
            <div className="flex flex-col gap-1">
              {metaData.title && (
                <p className="text-md font-bold md:text-lg">
                  {metaData.title}
                </p>
              )}
              {metaData.description && (
                <p className="text-fg-mute line-clamp-2 text-xs md:text-sm">
                  {metaData.description}
                </p>
              )}
            </div>
          )}
          <div className="text-fg-mute flex items-center gap-1">
            <ExternalLinkIcon size="sm" />
            <p className="text-xs">{new URL(href).hostname}</p>
          </div>
        </div>
      </div>
    </a>
  );
};

export const LinkCard: FC<{ href: string }> = ({ href }) => {
  return (
    <ErrorBoundary fallback={<Anchor href={href}>{href}</Anchor>}>
      <Suspense fallback={<Loading href={href} />}>
        <Content href={href} />
      </Suspense>
    </ErrorBoundary>
  );
};
