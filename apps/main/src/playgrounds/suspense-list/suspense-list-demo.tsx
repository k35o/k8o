'use client';

import { Alert, Checkbox } from '@k8ordo/ui';
import { sleep } from '@repo/helpers/sleep';
import { Suspense, use, useState } from 'react';
import type { FC } from 'react';

import styles from './suspense-list-demo.module.css';

type DataItem = {
  cacheKey: 'key1' | 'key2' | 'key3' | 'key4';
  getTime: Promise<number>;
};

const generateData = (): DataItem[] =>
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
    <div className={styles.fallback}>Loading...</div>
  ) : null;

  return (
    <div className={styles.root}>
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
  data: DataItem;
}> = ({ data }) => {
  const { cacheKey, getTime } = data;
  const resolvedTime = use(getTime);
  return (
    <div className={styles.item}>
      <span className={styles.dot} data-cache-key={cacheKey} />
      <p>Cache Key: {cacheKey}</p>
      <p>Time: {resolvedTime}ms</p>
    </div>
  );
};
