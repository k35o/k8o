'use client';

import { Alert, Checkbox } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import { sleep } from '@repo/helpers/sleep';
import { Suspense, use, useState } from 'react';
import type { FC } from 'react';

type Data = {
  cacheKey: 'key1' | 'key2' | 'key3' | 'key4';
  getTime: Promise<number>;
};

const generateData = (): Data[] =>
  [
    { cacheKey: 'key1', getTime: sleep(1500).then(() => 1500) },
    { cacheKey: 'key2', getTime: sleep(2000).then(() => 2000) },
    { cacheKey: 'key3', getTime: sleep(500).then(() => 500) },
    { cacheKey: 'key4', getTime: sleep(1000).then(() => 1000) },
  ] as const;

export const SuspenseListDemo: FC = () => {
  const [data, setData] = useState(() => generateData());
  const [hasFallback, setHasFallback] = useState(true);
  const fallback = hasFallback ? (
    <div className="bg-bg-mute rounded-xl p-4">Loading...</div>
  ) : null;

  return (
    <div className="flex flex-col gap-6">
      <Alert
        message="React v19.2、Nextjs v16で利用ができなくなったため、現在こちらの機能は利用できません。"
        tone="info"
      />
      <Checkbox
        label="フォールバックUIを表示する"
        onChange={(checked) => {
          setData(() => generateData());
          setHasFallback(checked);
        }}
        checked={hasFallback}
      />
      {data.map(({ cacheKey, getTime }) => (
        <Suspense fallback={fallback} key={cacheKey}>
          <Data data={{ cacheKey, getTime }} />
        </Suspense>
      ))}
    </div>
  );
};

const Data: FC<{
  data: Data;
}> = ({ data }) => {
  const { cacheKey, getTime } = data;
  const resolvedTime = use(getTime);
  return (
    <div className="border-border-mute flex items-center gap-2 rounded-md border p-4">
      <span
        className={cn(
          'size-4 rounded-full',
          cacheKey === 'key1'
            ? 'bg-group-primary'
            : cacheKey === 'key2'
              ? 'bg-group-secondary'
              : cacheKey === 'key3'
                ? 'bg-group-tertiary'
                : 'bg-group-quaternary',
        )}
      />
      <p>Cache Key: {cacheKey}</p>
      <p>Time: {resolvedTime}ms</p>
    </div>
  );
};
