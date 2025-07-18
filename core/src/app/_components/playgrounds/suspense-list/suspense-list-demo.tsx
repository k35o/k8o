'use client';

import { SuspenseList } from '#libs/react';
import { Checkbox } from '@k8o/components/form/checkbox';
import { FormControl } from '@k8o/components/form/form-control';
import { Select } from '@k8o/components/form/select';
import { cn } from '@k8o/helpers/cn';
import { sleep } from '@k8o/helpers/sleep';
import {
  FC,
  useState,
  Suspense,
  SuspenseListProps,
  use,
  useCallback,
  SuspenseListTailMode,
} from 'react';

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
    useState<Exclude<SuspenseListProps['revealOrder'], undefined>>(
      'together',
    );
  const [tail, setTail] =
    useState<Exclude<SuspenseListProps['tail'], undefined>>(
      'collapsed',
    );

  const hasTail =
    revealOrder !== 'together' && revealOrder !== 'independent';

  const suspenseListProps = hasTail
    ? { revealOrder, tail }
    : { revealOrder };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Checkbox
          label="SuspenseListを利用する"
          value={useSuspenseList}
          onChange={(e) => {
            resetData();
            setUseSuspenseList(e.target.checked);
          }}
        />
        <Checkbox
          label="フォルバックUIを表示する"
          value={hasFallback}
          onChange={(e) => {
            resetData();
            setHasFallback(e.target.checked);
          }}
        />
        <FormControl
          label="revealOrder"
          renderInput={({ labelId: _, ...props }) => (
            <Select
              {...props}
              options={[
                { value: 'together', label: 'together' },
                { value: 'forwards', label: 'forwards' },
                { value: 'backwards', label: 'backwards' },
              ]}
              value={revealOrder}
              onChange={(e) => {
                resetData();
                setRevealOrder(e.target.value as typeof revealOrder);
              }}
            />
          )}
        />
        <FormControl
          label="tail"
          renderInput={({ labelId: _, ...props }) => (
            <Select
              {...props}
              options={[
                { value: 'collapsed', label: 'collapsed' },
                { value: 'hidden', label: 'hidden' },
              ]}
              value={tail}
              onChange={(e) => {
                resetData();
                setTail(e.target.value as typeof tail);
              }}
            />
          )}
        />
      </div>
      <div className="bg-bg-mute flex items-center justify-center rounded-md p-4">
        <p className="text-fg-mute">
          {useSuspenseList
            ? `<SuspenseList revealOrder="${revealOrder}"${hasTail ? ` tail="${tail}"` : ''}>`
            : 'SuspenseListを利用していません。'}
        </p>
      </div>
      <DataList
        key={`SuspenseList-${JSON.stringify(suspenseListProps)}`}
        data={data}
        hasFallback={hasFallback}
        useSuspenseList={useSuspenseList}
        suspenseListProps={suspenseListProps}
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
        revealOrder:
          | 'forwards'
          | 'backwards'
          | 'unstable_legacy-backwards';
        tail: SuspenseListTailMode;
      }
    | {
        revealOrder: 'together' | 'independent';
        tail?: never;
      };
}> = ({ data, useSuspenseList, hasFallback, suspenseListProps }) => {
  const fallback = hasFallback ? (
    <div className="border-border-mute rounded-md border p-4">
      Loading...
    </div>
  ) : null;
  if (useSuspenseList) {
    return (
      <SuspenseList {...suspenseListProps}>
        {data.map(({ cacheKey, getTime }) => (
          <Suspense key={cacheKey} fallback={fallback}>
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
