import { formatDate } from '@/utils/date/format';
import { Calendar, Clock } from 'lucide-react';
import { FC, PropsWithChildren } from 'react';
import { Separator } from '@/components/separator';

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
    <article className="rounded-lg bg-bgBase/90 px-3 pb-14 pt-8 sm:px-10">
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
        <div className="flex flex-col items-end gap-1 text-xs text-textDescription sm:flex-row sm:items-center sm:justify-end sm:gap-2 sm:text-sm">
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
