import { ExternalLinkIcon, InteractiveCard } from '@k8o/arte-odyssey';
import type { FC } from 'react';

export type LinkCardAppearance = 'shadow' | 'bordered';

export const LinkCardFallback: FC<{
  href: string;
  appearance?: LinkCardAppearance;
}> = ({ href, appearance = 'shadow' }) => (
  <div className="vertical:max-w-container-md">
    <InteractiveCard appearance={appearance}>
      <a
        aria-label={href}
        className="group block h-full"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        <div className="flex h-full flex-col gap-2 p-4">
          <p className="text-md group-hover:text-primary-fg vertical:block vertical:max-block-[8em] vertical:overflow-hidden line-clamp-2 font-bold break-all transition-colors duration-200 ease-out">
            {href}
          </p>
          <div className="text-fg-subtle mt-auto flex items-center gap-1 text-xs">
            <ExternalLinkIcon size="sm" />
            <p>{new URL(href).hostname}</p>
          </div>
        </div>
      </a>
    </InteractiveCard>
  </div>
);
