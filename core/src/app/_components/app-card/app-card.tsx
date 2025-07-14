import { Heading } from '../../../components/heading';
import { InteractiveCard } from '@/components/card';
import { Route } from 'next';
import Link from 'next/link';
import { ReactNode } from 'react';

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
          <div className="bg-bg-mute text-emphasize flex size-24 shrink-0 items-center justify-center rounded-full">
            {symbol}
          </div>
          <div className="flex flex-col items-center gap-1">
            <Heading type="h3">{title}</Heading>
            <p className="text-fg-mute line-clamp-3 text-sm">
              {description}
            </p>
          </div>
        </div>
      </Link>
    </InteractiveCard>
  );
};
