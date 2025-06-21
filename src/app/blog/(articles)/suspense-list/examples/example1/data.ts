import { sleep } from '@/helpers/sleep';

let cache = new Map<string, Promise<number>>();

export const getTime = (key: string, time: number) => {
  if (!cache.has(key)) {
    cache.set(
      key,
      sleep(time).then(() => time),
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return cache.get(key)!;
};

export const purgeCache = () => {
  cache = new Map<string, Promise<number>>();
};
