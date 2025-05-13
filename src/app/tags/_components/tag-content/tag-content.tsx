import { InteractiveCard } from '@/components/card';
import { Heading } from '@/components/heading';
import { ChevronIcon, TagIcon } from '@/components/icons';
import { Separator } from '@/components/separator';
import { Route } from 'next';
import Link from 'next/link';
import { FC } from 'react';

export const TagContent: FC<{
  name: string;
  blogs: {
    id: number;
    slug: string;
    title: string;
  }[];
  services: {
    id: number;
    slug: string;
    title: string;
  }[];
}> = ({ name, blogs, services }) => {
  return (
    <div className="flex flex-col gap-8">
      <div className="bg-bg-base flex items-center gap-4 rounded-lg p-6">
        <div className="bg-primary-bg text-primary-fg flex size-10 items-center justify-center rounded-full">
          <TagIcon />
        </div>
        <div className="flex flex-col gap-2">
          <Heading type="h3">{name}</Heading>
          <p className="text-fg-mute text-sm">
            {blogs.length + services.length}件のコンテンツがあります
          </p>
        </div>
      </div>
      <div className="bg-bg-base flex flex-col gap-8 rounded-lg p-6">
        {services.length > 0 && (
          <div className="flex flex-col gap-4">
            <Link href="/">
              <Heading type="h4">サービス</Heading>
            </Link>
            <div className="grid-cols-auto-fill-70 grid justify-items-center gap-4">
              {services.map((service) => (
                <InteractiveCard
                  key={service.id}
                  width="fit"
                  animation="off"
                >
                  <Link
                    aria-label={`${service.title}を利用する`}
                    href={`/${service.slug}` as Route}
                    className="group border-border-base hover:bg-primary-bg-mute hover:text-primary-fg hover:border-primary-border flex w-70 flex-col gap-2 rounded-lg border p-4"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-lg font-bold">
                        {service.title}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm">
                        サービスを利用する
                      </span>
                      <span className="hidden group-hover:block">
                        <ChevronIcon direction="right" size="sm" />
                      </span>
                    </div>
                  </Link>
                </InteractiveCard>
              ))}
            </div>
          </div>
        )}
        {blogs.length > 0 && (
          <div className="flex flex-col gap-4">
            <Link href="/blog">
              <Heading type="h4">Blog</Heading>
            </Link>
            <div className="grid-cols-auto-fill-70 grid justify-items-center gap-4">
              {blogs.map((blog) => (
                <InteractiveCard
                  key={blog.id}
                  width="fit"
                  animation="off"
                >
                  <Link
                    aria-label={`${blog.title}を読む`}
                    href={`/blog/${blog.slug}` as Route}
                    className="group border-border-base hover:bg-primary-bg-mute hover:text-primary-fg hover:border-primary-border flex w-70 flex-col gap-2 rounded-lg border p-4"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-lg font-bold">
                        {blog.title}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm">
                        サービスを利用する
                      </span>
                      <span className="hidden group-hover:block">
                        <ChevronIcon direction="right" size="sm" />
                      </span>
                    </div>
                  </Link>
                </InteractiveCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
