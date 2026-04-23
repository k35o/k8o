import { ExternalLinkIcon, InteractiveCard } from '@k8o/arte-odyssey';
import type { FC } from 'react';

export type LinkCardAppearance = 'shadow' | 'bordered';

export const LinkCardFallback: FC<{
  href: string;
  appearance?: LinkCardAppearance;
}> = ({ href, appearance = 'shadow' }) => {
  return (
    <InteractiveCard appearance={appearance}>
      <a
        className="group block h-full"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        <div className="flex h-full flex-col gap-2 p-4">
          <p className="line-clamp-2 break-all font-bold text-md transition-colors duration-200 ease-out group-hover:text-primary-fg">
            {href}
          </p>
          <div className="mt-auto flex items-center gap-1 text-fg-subtle text-xs">
            <ExternalLinkIcon size="sm" />
            <p>{new URL(href).hostname}</p>
          </div>
        </div>
      </a>
    </InteractiveCard>
  );
};
