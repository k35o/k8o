import { Route } from 'next';
import Link from 'next/link';

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
    <section className="h-40 rounded-md border-2 border-neutral-500">
      <Link href={link}>
        <div className="flex gap-6 p-4">
          <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-md bg-white text-7xl">
            {emotion}
          </div>
          <div>
            <h3 className="text-2xl font-medium">{title}</h3>
            <p className="line-clamp-3">{description}</p>
          </div>
        </div>
      </Link>
    </section>
  );
};
