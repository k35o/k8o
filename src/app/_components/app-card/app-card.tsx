import { Route } from 'next';
import Link from 'next/link';
import { Heading } from '../heading';

export const AppCard = <T extends string>({
  link,
  emotion,
  title,
  description,
}: {
  link: Route<T>;
  emotion: string;
  title: string;
  description: string;
}) => {
  return (
    <section className="h-40 rounded-md bg-white shadow-md">
      <Link href={link}>
        <div className="flex gap-6 p-4">
          <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-md bg-gray text-7xl">
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
