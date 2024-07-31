import { Heading } from '@/components/heading';
import { TextTag } from '@/components/text-tag';
import { isInternalRoute } from '@/utils/is-internal-route';
import Link from 'next/link';

export const BlogCard = ({
  link,
  emotion,
  title,
  tags,
}: {
  link: string;
  emotion: string;
  title: string;
  tags: [string?, string?, string?, string?, string?];
}) => {
  return (
    <section className="h-40 rounded-xl bg-white shadow-md">
      {isInternalRoute(link) ? (
        <Link href={link}>
          <div className="flex gap-6 p-4">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-lg bg-bgLight text-7xl">
              {emotion}
            </div>
            <div className="flex w-full flex-col justify-around">
              <Heading type="h3" lineClamp={3}>
                {title}
              </Heading>
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
      ) : (
        <a href={link} target="_blank" rel="noopener noreferrer">
          <div className="flex gap-6 p-4">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-lg bg-bgLight text-7xl">
              {emotion}
            </div>
            <div className="flex w-full flex-col justify-around">
              <Heading type="h3" lineClamp={3}>
                {title}
              </Heading>
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
        </a>
      )}
    </section>
  );
};
