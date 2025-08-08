import { Anchor } from '@k8o/arte-odyssey/anchor';
import { ErrorBoundary } from '@k8o/arte-odyssey/error-boundary';
import { ExternalLinkIcon } from '@k8o/arte-odyssey/icons';
import { type FC, Suspense } from 'react';
import { getMetadata } from '#link-card/metadata';
import { MetaImage } from './image';

const Loading: FC<{ href: string }> = ({ href }) => {
  return (
    <a href={href} rel="noopener noreferrer" target="_blank">
      <div className="flex animate-pulse flex-col gap-4 rounded-md border border-border-base bg-bg-base/90 sm:flex-row">
        <div className="h-40 w-full rounded-l-sm bg-bg-mute sm:h-auto sm:w-1/3 sm:max-w-56" />
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex animate-pulse flex-col gap-1">
            <p className="font-bold text-md md:text-lg">Loading...</p>
            <p className="text-fg-mute text-xs md:text-sm">Loading...</p>
          </div>
          <div className="flex items-center gap-1 text-fg-mute">
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

  if (!(metaData.title || metaData.description || metaData.image)) {
    return <Anchor href={href}>{href}</Anchor>;
  }

  return (
    <a href={href} rel="noopener noreferrer" target="_blank">
      <div className="flex flex-col gap-4 rounded-md border border-border-base bg-bg-base/90 sm:flex-row">
        {metaData.image && <MetaImage src={metaData.image} />}
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
          <div className="flex items-center gap-1 text-fg-mute">
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
