import { Route } from 'next';
import Link from 'next/link';
import { Heading } from '../../../components/heading';
import { ReactNode } from 'react';

export const AppCard = <T extends string>({
  link,
  emotion,
  title,
  description,
}: {
  link: Route<T>;
  emotion: ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <section className="h-40 rounded-xl bg-bgBase/55 shadow-md">
      <Link href={link}>
        <div className="flex gap-6 p-4">
          <div className="flex size-32 shrink-0 items-center justify-center rounded-lg bg-bgSecondary text-7xl">
            {emotion}
          </div>
          <div>
            <Heading type="h3">{title}</Heading>
            <p className="line-clamp-3">{description}</p>
          </div>
        </div>
      </Link>
    </section>
  );
};
