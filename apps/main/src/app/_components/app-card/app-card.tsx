import {
  ChevronIcon,
  ExternalLinkIcon,
  Heading,
  InteractiveCard,
} from '@k8o/arte-odyssey';
import type { Route } from 'next';
import Link from 'next/link';
import type { ReactElement } from 'react';

export const AppCard = ({
  link,
  accent,
  title,
  description,
}: {
  link: Route | `https://${string}`;
  accent?: ReactElement | undefined;
  title: string;
  description: string;
}) => {
  const isExternal = typeof link === 'string' && link.startsWith('https://');

  const content = (
    <div className="flex h-full flex-col p-6 text-left">
      <div className="flex items-center gap-3">
        {accent === undefined ? null : (
          <div className="flex size-8 shrink-0 items-center justify-center text-primary-fg">
            {accent}
          </div>
        )}
        <Heading type="h3">{title}</Heading>
      </div>

      <p className="mt-3 line-clamp-3 flex-1 text-fg-mute text-sm leading-relaxed">
        {description}
      </p>

      <div className="mt-5 flex items-center justify-end">
        <span className="flex items-center text-fg-subtle transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-primary-fg">
          {isExternal ? (
            <ExternalLinkIcon size="sm" />
          ) : (
            <ChevronIcon direction="right" size="sm" />
          )}
        </span>
      </div>
    </div>
  );

  return (
    <InteractiveCard>
      {isExternal ? (
        <a
          className="group"
          href={link}
          rel="noopener noreferrer"
          target="_blank"
        >
          {content}
        </a>
      ) : (
        <Link className="group" href={link}>
          {content}
        </Link>
      )}
    </InteractiveCard>
  );
};
