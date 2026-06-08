import {
  ExternalLinkIcon,
  InteractiveCard,
  PublishDateIcon,
} from '@k8o/arte-odyssey';
import { formatDate } from '@repo/helpers/date/format';
import { type FC, Suspense } from 'react';

import { LinkCardErrorBoundary } from './error-boundary';
import { type LinkCardAppearance, LinkCardFallback } from './fallback';
import { MetaImage } from './image';
import { getMetadata } from './metadata';

const LinkCardLoading: FC<{
  href: string;
  appearance?: LinkCardAppearance;
}> = ({ href, appearance = 'shadow' }) => (
  <div className="vertical:max-w-container-md">
    <InteractiveCard appearance={appearance}>
      <a
        aria-label={`${href}（読み込み中）`}
        className="block"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        <div className="vertical:flex-row flex animate-pulse flex-col overflow-hidden sm:flex-row">
          <div className="bg-bg-mute vertical:w-48 vertical:shrink-0 vertical:rounded-s-xl vertical:rounded-e-none w-full rounded-t-xl sm:w-48 sm:shrink-0 sm:rounded-s-xl sm:rounded-e-none">
            <div className="bg-bg-mute aspect-video w-full" />
          </div>
          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="bg-bg-mute h-5 w-3/4 rounded-md" />
            <div className="bg-bg-mute h-4 w-full rounded-md" />
            <div className="bg-bg-mute mt-auto h-3 w-1/3 rounded-md" />
          </div>
        </div>
      </a>
    </InteractiveCard>
  </div>
);

const Content: FC<{
  href: string;
  publishedAt?: Date | string | undefined;
  appearance?: LinkCardAppearance;
}> = async ({ href, publishedAt, appearance = 'shadow' }) => {
  let metaData;
  try {
    metaData = await getMetadata(href);
  } catch {
    return <LinkCardFallback appearance={appearance} href={href} />;
  }

  if (
    metaData.title === undefined &&
    metaData.description === undefined &&
    metaData.imageUrl === undefined
  ) {
    return <LinkCardFallback appearance={appearance} href={href} />;
  }

  return (
    <div className="vertical:max-w-container-md">
      <InteractiveCard appearance={appearance}>
        <a
          className="group block h-full"
          href={href}
          rel="noopener noreferrer"
          target="_blank"
        >
          <div className="vertical:flex-row flex h-full flex-col overflow-hidden sm:flex-row">
            {metaData.imageUrl !== undefined && (
              <MetaImage src={metaData.imageUrl} />
            )}
            <div className="flex flex-1 flex-col gap-2 p-4">
              {metaData.title !== undefined && (
                <div className="group-hover:text-primary-fg flex flex-col gap-1 transition-colors duration-200 ease-out">
                  <p className="text-md vertical:block vertical:max-block-[8em] vertical:overflow-hidden line-clamp-2 font-bold">
                    {metaData.title}
                  </p>
                  {metaData.description !== undefined && (
                    <p className="text-fg-mute vertical:block vertical:max-block-[8em] vertical:overflow-hidden line-clamp-2 text-sm">
                      {metaData.description}
                    </p>
                  )}
                </div>
              )}
              <div className="text-fg-subtle mt-auto flex flex-wrap items-center justify-between gap-2 text-xs">
                {publishedAt !== undefined && (
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
    </div>
  );
};

export const LinkCard: FC<{
  href: string;
  publishedAt?: Date | string | undefined;
  appearance?: LinkCardAppearance;
}> = ({ href, publishedAt, appearance = 'shadow' }) => (
  <LinkCardErrorBoundary appearance={appearance} href={href}>
    <Suspense
      fallback={<LinkCardLoading appearance={appearance} href={href} />}
    >
      <Content appearance={appearance} href={href} publishedAt={publishedAt} />
    </Suspense>
  </LinkCardErrorBoundary>
);
