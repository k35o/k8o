import { News } from '../../_types';
import { InteractiveCard } from '@k8o/arte-odyssey/card';
import { Heading } from '@k8o/arte-odyssey/heading';
import {
  PublishDateIcon,
  UpdateDateIcon,
} from '@k8o/arte-odyssey/icons';
import { formatDate } from '@k8o/helpers/date';
import Link from 'next/link';
import { FC } from 'react';

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
            <div className="text-fg-mute flex flex-wrap items-center gap-1">
              <div className="flex items-center gap-1">
                <PublishDateIcon size="sm" />
                <span className="text-sm">
                  公開: {formatDate(new Date(createdAt))}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <UpdateDateIcon size="sm" />
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
