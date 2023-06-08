import { TextTag } from '@/components/text-tag';
import { Route } from 'next';
import Link from 'next/link';

export const BlogCard = <T extends string>({
  link,
  emotion,
  title,
  tags,
}: {
  link: Route<T>;
  emotion: string;
  title: string;
  tags: [string?, string?, string?, string?, string?];
}) => {
  return (
    <section className="h-40 rounded-md bg-white shadow-md">
      <Link href={link}>
        <div className="flex gap-6 p-4">
          <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-md bg-gray-200 text-7xl">
            {emotion}
          </div>
          <div className="flex w-full flex-col justify-around">
            <h3 className="line-clamp-3 text-2xl font-medium">
              {title}
            </h3>
            {tags.length > 0 && (
              <div className="hidden justify-end gap-2 md:flex">
                {tags.map((tag) => {
                  if (!tag) {
                    return null;
                  }
                  return <TextTag key={tag} text={tag} />;
                })}
              </div>
            )}
          </div>
        </div>
      </Link>
    </section>
  );
};
