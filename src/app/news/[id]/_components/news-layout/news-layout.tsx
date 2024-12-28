import { formatDate } from '@/utils/date/format';
import { Calendar, Clock } from 'lucide-react';
import { FC, PropsWithChildren } from 'react';
import { Separator } from '@/components/separator';
import { Heading } from '@/components/heading';

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
    <article className="h-full rounded-lg bg-bgBase/90 px-10 pb-14 pt-8">
      <div className="flex flex-col gap-3">
        <Heading type="h3">{title}</Heading>
        <div className="flex flex-row items-center justify-end gap-2 text-sm text-textDescription">
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
      <div className="mb-2 mt-4 w-full sm:mb-4 sm:mt-8">
        <Separator />
      </div>
      {children}
    </article>
  );
};
