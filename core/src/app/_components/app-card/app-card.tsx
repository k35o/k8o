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
  link: Route;
  symbol: ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <InteractiveCard>
      <Link href={link}>
        <div className="flex h-full flex-col items-center gap-4 p-4">
          <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-bg-mute text-emphasize">
            {symbol}
          </div>
          <div className="flex flex-col items-center gap-1">
            <Heading type="h3">{title}</Heading>
            <p className="line-clamp-3 text-fg-mute text-sm">{description}</p>
          </div>
        </div>
      </Link>
    </InteractiveCard>
  );
};
