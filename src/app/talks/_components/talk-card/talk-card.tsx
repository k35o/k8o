import { Button } from '@/components/button';
import { Card } from '@/components/card';
import {
  BlogIcon,
  LocationIcon,
  PublishDateIcon,
  SlideIcon,
  TagIcon,
} from '@/components/icons';
import { TextTag } from '@/components/text-tag';
import { formatDate } from '@/utils/date/format';
import { FC } from 'react';

export const TalkCard: FC = () => {
  return (
    <Card>
      <div className="flex flex-col gap-6 p-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">
            React19で変化したuseReducerの型から学ぶTypeScriptの型推論
          </h2>
          <p className="text-fg-mute text-lg">TSKaigi 2025</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="text-fg-mute flex items-center gap-1">
            <PublishDateIcon size="sm" />
            <span>{formatDate(new Date('2025-05-23'))}</span>
          </div>
          <div className="text-fg-mute flex items-center gap-1">
            <LocationIcon size="sm" />
            <span>ベルサール神田</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TagIcon size="sm" />
          <TextTag text="TSKaigi" size="sm" />
          <TextTag text="TypeScript" size="sm" />
          <TextTag text="React" size="sm" />
          <TextTag text="useReducer" size="sm" />
        </div>
        <div className="flex gap-4">
          <Button
            variant="outlined"
            size="sm"
            startIcon={<SlideIcon size="sm" />}
          >
            スライドを見る
          </Button>
          <Button size="sm" startIcon={<BlogIcon size="sm" />}>
            ブログで解説を読む
          </Button>
        </div>
      </div>
    </Card>
  );
};
