import { Route } from 'next';
import Link from 'next/link';
import { Heading } from '@/components/heading';

export const AppCard = ({
  link,
  emotion,
  title,
  description,
}: {
  link: Route;
  emotion: string;
  title: string;
  description: string;
}) => {
  return (
    <section className="w-full rounded-xl bg-bgSecondary shadow-md">
      <Link href={link} className="block w-full">
        <div className="flex flex-col gap-6 p-4">
          <Heading type="h3">
            {emotion}&nbsp;
            {title}
          </Heading>
          <p className="line-clamp-3">{description}</p>
        </div>
      </Link>
    </section>
  );
};
