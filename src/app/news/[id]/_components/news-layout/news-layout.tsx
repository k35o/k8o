import { Heading } from '@/components/heading';
import { Separator } from '@/components/separator';
import { formatDate } from '@/utils/date/format';
import { Calendar, Clock } from 'lucide-react';
import { FC, PropsWithChildren } from 'react';

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
    <article className="bg-bg-base/90 h-full rounded-md px-10 pt-8 pb-14">
      <div className="flex flex-col gap-3">
        <Heading type="h3">{title}</Heading>
        <div className="text-fg-mute flex flex-row items-center justify-end gap-2 text-sm">
          <div className="flex flex-wrap items-center justify-end gap-1">
            <div className="flex items-center gap-1">
              <Calendar className="size-4" aria-label="" />
              <span>公開: {formatDate(new Date(createdAt))}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="size-4" aria-label="" />
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
