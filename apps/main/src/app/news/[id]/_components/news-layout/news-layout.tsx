import { Heading } from '@k8o/arte-odyssey/heading';
import { PublishDateIcon, UpdateDateIcon } from '@k8o/arte-odyssey/icons';
import { Separator } from '@k8o/arte-odyssey/separator';
import { formatDate } from '@k8o/helpers/date/format';
import type { FC, PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
  title: string;
  createdAt: string;
  updatedAt: string;
}>;

export const NewsLayout: FC<Props> = ({
  title,
  createdAt,
  updatedAt,
  children,
}) => {
  return (
    <article className="h-full rounded-md bg-bg-base/90 px-10 pt-8 pb-14">
      <div className="flex flex-col gap-3">
        <Heading type="h3">{title}</Heading>
        <div className="flex flex-row items-center justify-end gap-2 text-fg-mute text-sm">
          <div className="flex flex-wrap items-center justify-end gap-1">
            <div className="flex items-center gap-1">
              <PublishDateIcon size="sm" />
              <span>公開: {formatDate(new Date(createdAt))}</span>
            </div>
            <div className="flex items-center gap-1">
              <UpdateDateIcon size="sm" />
              <span>更新: {formatDate(new Date(updatedAt))}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 mb-2 w-full sm:mt-8 sm:mb-4">
        <Separator />
      </div>
      {children}
    </article>
  );
};
