import {
  Card,
  ChevronIcon,
  ExternalLinkIcon,
  Heading,
} from '@k8o/arte-odyssey';
import type { Route } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

export const AppCard = ({
  link,
  title,
  description,
  icon,
}: {
  link: Route | `https://${string}`;
  title: string;
  description: string;
  icon?: ReactNode | undefined;
}) => {
  const isExternal = typeof link === 'string' && link.startsWith('https://');

  const content = (
    <div className="flex h-full flex-col p-7 text-left">
      <div className="flex items-center gap-3">
        {icon === undefined ? null : (
          <span className="bg-bg-mute text-primary-fg flex size-10 shrink-0 items-center justify-center rounded-lg">
            {icon}
          </span>
        )}
        <Heading type="h3">{title}</Heading>
      </div>

      <p className="text-fg-mute mt-4 line-clamp-3 flex-1 text-sm leading-relaxed">
        {description}
      </p>

      <div className="mt-6 flex items-center justify-end">
        <span className="text-fg-subtle group-hover:text-primary-fg flex items-center transition-all duration-150 ease-out group-hover:translate-x-0.5">
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
    <Card appearance="shadow" interactive>
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
    </Card>
  );
};
