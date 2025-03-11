import { Anchor } from '../anchor';
import { ExternalLinkIcon } from '../icons';
import { getMetadata } from '#link-card/metadata';
import Image from 'next/image';
import { FC, Suspense } from 'react';

const Loading: FC<{ href: string }> = ({ href }) => {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <div className="bg-bg-base/90 border-border-base flex animate-pulse flex-col gap-4 rounded-md border sm:flex-row">
        <div className="bg-bg-mute h-40 w-full rounded-l-sm sm:h-auto sm:w-1/3 sm:max-w-56" />
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex animate-pulse flex-col gap-1">
            <p className="text-lg font-bold">Loading...</p>
            <p className="text-fg-mute text-sm">Loading...</p>
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
        {metaData.image && (
          <div className="bg-bg-emphasize relative h-40 w-full rounded-l-sm sm:h-auto sm:w-1/3">
            <Image
              src={metaData.image}
              alt=""
              fill
              className="rounded-l-sm object-contain"
              unoptimized
            />
          </div>
        )}
        <div className="flex flex-1 flex-col gap-3 p-4">
          {metaData.title && (
            <div className="flex flex-col gap-1">
              {metaData.title && (
                <p className="text-lg font-bold">{metaData.title}</p>
              )}
              {metaData.description && (
                <p className="text-fg-mute line-clamp-2 text-sm">
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
    <Suspense fallback={<Loading href={href} />}>
      <Content href={href} />
    </Suspense>
  );
};
