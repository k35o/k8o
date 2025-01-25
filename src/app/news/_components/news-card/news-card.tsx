import { Heading } from '@/components/heading';
import { InteractiveCard } from '@/components/card';
import { FC } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { formatDate } from '@/utils/date/format';
import { News } from '../../_types';
import Link from 'next/link';

type Props = Pick<
  News,
  'id' | 'title' | 'summary' | 'createdAt' | 'updatedAt'
> & {
  draftKey?: string;
};

export const NewsCard: FC<Props> = ({
  id,
  title,
  summary,
  createdAt,
  updatedAt,
  draftKey,
}) => {
  return (
    <InteractiveCard>
      <Link
        href={
          draftKey
            ? `/news/${id}?draftKey=${draftKey}`
            : `/news/${id}`
        }
      >
        <div className="flex flex-col gap-4 px-6 py-4">
          <div className="flex flex-col gap-1">
            <Heading type="h3">{title}</Heading>
            <div className="text-text-description flex flex-wrap items-center gap-1">
              <div className="flex items-center gap-1">
                <Calendar className="size-4" aria-label="" />
                <span className="text-sm">
                  公開: {formatDate(new Date(createdAt))}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="size-4" aria-label="" />
                <span className="text-sm">
                  更新: {formatDate(new Date(updatedAt))}
                </span>
              </div>
            </div>
          </div>
          <div>
            {summary.split('\n').map((text) => {
              return <p key={text}>{text}</p>;
            })}
          </div>
        </div>
      </Link>
    </InteractiveCard>
  );
};
