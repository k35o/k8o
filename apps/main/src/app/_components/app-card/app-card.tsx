import { InteractiveCard } from '@k8o/arte-odyssey/card';
import { Heading } from '@k8o/arte-odyssey/heading';
import type { Route } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

export const AppCard = ({
  link,
  symbol,
  title,
  description,
}: {
  link: Route | `https://${string}`;
  symbol: ReactNode;
  title: string;
  description: string;
}) => {
  const isExternal = typeof link === 'string' && link.startsWith('https://');

  const content = (
    <div className="flex h-full flex-col items-center gap-4 p-4 group-hover:text-primary-fg">
      <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-bg-mute text-emphasize group-hover:bg-primary-bg-mute">
        {symbol}
      </div>
      <div className="flex flex-col items-center gap-1">
        <Heading type="h3">{title}</Heading>
        <p className="line-clamp-3 text-fg-mute text-sm">{description}</p>
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
