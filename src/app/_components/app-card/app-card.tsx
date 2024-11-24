import { Route } from 'next';
import Link from 'next/link';
import { Heading } from '../../../components/heading';
import { ReactNode } from 'react';
import { InteractiveCard } from '@/components/card';

export const AppCard = <T extends string>({
  link,
  symbol,
  title,
  description,
}: {
  link: Route<T>;
  symbol: ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <InteractiveCard>
      <Link href={link} scroll={false}>
        <div className="flex flex-col items-center gap-4 p-4">
          <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-bgSecondary text-5xl">
            {symbol}
          </div>
          <div className="flex flex-col items-center gap-1">
            <Heading type="h3">{title}</Heading>
            <p className="line-clamp-3">{description}</p>
          </div>
        </div>
      </Link>
    </InteractiveCard>
  );
};
