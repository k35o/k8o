'use client';

import { Alert, Checkbox } from '@k8ordo/ui';
import { sleep } from '@repo/helpers/sleep';
import { Fragment, Suspense, use, useState, useSyncExternalStore } from 'react';
import type { FC } from 'react';

import styles from './suspense-list-demo.module.css';

type CacheKey = 'key1' | 'key2' | 'key3' | 'key4';

type DataItem = {
  cacheKey: CacheKey;
  getTime: Promise<number>;
};

const CACHE_KEYS: readonly CacheKey[] = ['key1', 'key2', 'key3', 'key4'];

const generateData = (): DataItem[] =>
  [
    { cacheKey: 'key1', getTime: sleep(1500).then(() => 1500) },
    { cacheKey: 'key2', getTime: sleep(2000).then(() => 2000) },
    { cacheKey: 'key3', getTime: sleep(500).then(() => 500) },
    { cacheKey: 'key4', getTime: sleep(1000).then(() => 1000) },
  ] as const;

const subscribe = (): (() => void) => () => {};
const getSnapshot = (): boolean => true;
const getServerSnapshot = (): boolean => false;

export const SuspenseListDemo: FC = () => {
  const [data, setData] = useState(() => generateData());
  const [hasFallback, setHasFallback] = useState(true);
  // サーバーで Data を描くと、HTML に読み込み後の値が書かれ、読み込みの順が見えないので、hydrate のあとに描く
  const hydrated = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
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
      {hydrated
        ? data.map(({ cacheKey, getTime }) => (
            <Suspense fallback={fallback} key={cacheKey}>
              <Data data={{ cacheKey, getTime }} />
            </Suspense>
          ))
        : CACHE_KEYS.map((cacheKey) => (
            <Fragment key={cacheKey}>{fallback}</Fragment>
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
