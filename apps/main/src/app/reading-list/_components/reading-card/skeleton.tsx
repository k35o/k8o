import { Card } from '@k8o/arte-odyssey';
import type { FC } from 'react';

export const ReadingCardSkeleton: FC = () => (
  <div className="vertical:max-w-container-md">
    <Card interactive appearance="shadow">
      <div className="vertical:flex-row flex animate-pulse flex-col overflow-hidden sm:flex-row">
        <div className="bg-bg-mute vertical:w-48 vertical:shrink-0 vertical:rounded-s-xl vertical:rounded-e-none w-full rounded-t-xl sm:w-48 sm:shrink-0 sm:rounded-s-xl sm:rounded-e-none">
          <div className="bg-bg-mute aspect-video w-full" />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="bg-bg-mute h-5 w-3/4 rounded-md" />
          <div className="bg-bg-mute h-4 w-full rounded-md" />
          <div className="bg-bg-mute mt-auto h-3 w-1/3 rounded-md" />
        </div>
      </div>
    </Card>
  </div>
);
