'use client';

import { Checkbox } from '@k8o/arte-odyssey/form/checkbox';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { Select } from '@k8o/arte-odyssey/form/select';
import { cn } from '@k8o/helpers/cn';
import { sleep } from '@k8o/helpers/sleep';
import {
  type FC,
  Suspense,
  type SuspenseListProps,
  type SuspenseListTailMode,
  use,
  useCallback,
  useState,
} from 'react';
import { SuspenseList } from '@/libs/react';

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
  const resetData = useCallback(() => {
    setData(() => generateData());
  }, []);
  const [useSuspenseList, setUseSuspenseList] = useState(true);
  const [hasFallback, setHasFallback] = useState(true);
  const [revealOrder, setRevealOrder] =
    useState<Exclude<SuspenseListProps['revealOrder'], undefined>>('together');
  const [tail, setTail] =
    useState<Exclude<SuspenseListProps['tail'], undefined>>('collapsed');

  const hasTail = revealOrder !== 'together' && revealOrder !== 'independent';

  const suspenseListProps = hasTail ? { revealOrder, tail } : { revealOrder };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Checkbox
          label="SuspenseListを利用する"
          onChange={(e) => {
            resetData();
            setUseSuspenseList(e.target.checked);
          }}
          value={useSuspenseList}
        />
        <Checkbox
          label="フォルバックUIを表示する"
          onChange={(e) => {
            resetData();
            setHasFallback(e.target.checked);
          }}
          value={hasFallback}
        />
        <FormControl
          label="revealOrder"
          renderInput={({ labelId: _, ...props }) => (
            <Select
              {...props}
              onChange={(e) => {
                resetData();
                setRevealOrder(e.target.value as typeof revealOrder);
              }}
              options={[
                { value: 'together', label: 'together' },
                { value: 'forwards', label: 'forwards' },
                { value: 'backwards', label: 'backwards' },
              ]}
              value={revealOrder}
            />
          )}
        />
        <FormControl
          label="tail"
          renderInput={({ labelId: _, ...props }) => (
            <Select
              {...props}
              onChange={(e) => {
                resetData();
                setTail(e.target.value as typeof tail);
              }}
              options={[
                { value: 'collapsed', label: 'collapsed' },
                { value: 'hidden', label: 'hidden' },
              ]}
              value={tail}
            />
          )}
        />
      </div>
      <div className="flex items-center justify-center rounded-md bg-bg-mute p-4">
        <p className="text-fg-mute">
          {useSuspenseList
            ? `<SuspenseList revealOrder="${revealOrder}"${hasTail ? ` tail="${tail}"` : ''}>`
            : 'SuspenseListを利用していません。'}
        </p>
      </div>
      <DataList
        data={data}
        hasFallback={hasFallback}
        key={`SuspenseList-${JSON.stringify(suspenseListProps)}`}
        suspenseListProps={suspenseListProps}
        useSuspenseList={useSuspenseList}
      />
    </div>
  );
};

const DataList: FC<{
  data: Data[];
  useSuspenseList: boolean;
  hasFallback: boolean;
  suspenseListProps:
    | {
        revealOrder: 'forwards' | 'backwards' | 'unstable_legacy-backwards';
        tail: SuspenseListTailMode;
      }
    | {
        revealOrder: 'together' | 'independent';
        tail?: never;
      };
}> = ({ data, useSuspenseList, hasFallback, suspenseListProps }) => {
  const fallback = hasFallback ? (
    <div className="rounded-md border border-border-mute p-4">Loading...</div>
  ) : null;
  if (useSuspenseList) {
    return (
      <SuspenseList {...suspenseListProps}>
        {data.map(({ cacheKey, getTime }) => (
          <Suspense fallback={fallback} key={cacheKey}>
            <Data data={{ cacheKey, getTime }} />
          </Suspense>
        ))}
      </SuspenseList>
    );
  }
  return (
    <>
      {data.map(({ cacheKey, getTime }) => (
        <Suspense fallback={fallback} key={cacheKey}>
          <Data data={{ cacheKey, getTime }} />
        </Suspense>
      ))}
    </>
  );
};

const Data: FC<{
  data: Data;
}> = ({ data }) => {
  const { cacheKey, getTime } = data;
  const resolvedTime = use(getTime);
  return (
    <div className="flex items-center gap-2 rounded-md border border-border-mute p-4">
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
