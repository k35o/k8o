'use client';

import { Alert, Button } from '@k8ordo/ui';
import { use, useEffect, useState } from 'react';
import type { FC } from 'react';

import { ReadingListContent } from '../reading-list-content/reading-list-content';
import {
  forgetFailedReadingList,
  loadReadingList,
} from '../reading-list-source/reading-list-source';

export const ReadingListLoader: FC = () => {
  const [request, setRequest] = useState(loadReadingList);
  const days = use(request);
  const failed = days === null;

  // 案内を出したら読めなかった結果を捨て、あとで開き直したときに新しく読む
  useEffect(() => {
    if (failed) {
      forgetFailedReadingList(request);
    }
  }, [failed, request]);

  if (failed) {
    return (
      <Alert
        action={{
          label: 'もう一度読み込む',
          renderItem: ({ children }) => (
            <Button
              onAction={async () => {
                forgetFailedReadingList(request);
                const next = loadReadingList();
                setRequest(next);
                await next;
              }}
              size="sm"
              variant="outline"
            >
              {children}
            </Button>
          ),
        }}
        message="記事を読み込めませんでした。時間をおいて、もう一度お試しください"
        tone="error"
      />
    );
  }

  return <ReadingListContent days={days} />;
};
