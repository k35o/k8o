'use client';

import { getTime, purgeCache } from './data';
import { Checkbox } from '@/components/form/checkbox';
import { FormControl } from '@/components/form/form-control';
import { Select } from '@/components/form/select';
import { cn } from '@/helpers/cn';
import {
  FC,
  useState,
  unstable_SuspenseList as SuspenseList,
  Suspense,
  SuspenseListProps,
  use,
  SuspenseListTailMode,
} from 'react';

export const Example1: FC = () => {
  const [useSuspenseList, setUseSuspenseList] = useState(true);
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
            purgeCache();
            setUseSuspenseList(e.target.checked);
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
                purgeCache();
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
                purgeCache();
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
        useSuspenseList={useSuspenseList}
        suspenseListProps={suspenseListProps}
      />
    </div>
  );
};

const data = [
  { cacheKey: 'key1', time: 2000 },
  { cacheKey: 'key2', time: 1500 },
  { cacheKey: 'key3', time: 500 },
  { cacheKey: 'key4', time: 1000 },
] as const;

const DataList: FC<{
  useSuspenseList: boolean;
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
}> = ({ useSuspenseList, suspenseListProps }) => {
  if (useSuspenseList) {
    return (
      <SuspenseList {...suspenseListProps}>
        {data.map(({ cacheKey, time }) => (
          <Suspense
            key={cacheKey}
            fallback={
              <div className="border-border-mute rounded-md border p-4">
                Loading...
              </div>
            }
          >
            <Data cacheKey={cacheKey} time={time} />
          </Suspense>
        ))}
      </SuspenseList>
    );
  }
  return (
    <>
      {data.map(({ cacheKey, time }) => (
        <Suspense
          fallback={
            <div className="border-border-mute rounded-md border p-4">
              Loading...
            </div>
          }
          key={cacheKey}
        >
          <Data cacheKey={cacheKey} time={time} />
        </Suspense>
      ))}
    </>
  );
};

const Data: FC<{
  cacheKey: (typeof data)[number]['cacheKey'];
  time: number;
}> = ({ cacheKey, time }) => {
  const data = use(getTime(cacheKey, time));
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
      <p>Time: {data}ms</p>
    </div>
  );
};
