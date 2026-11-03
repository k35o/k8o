import { definePageState } from '@k8ordo/state';
import * as z from 'zod/mini';

// 絞り込みの真偽値は文字列のまま持ち、readFlag で読む。z.stringbool は ?widely=1 を真に、
// ?widely=abc を既定の真に読み、外に貼られたリンクでチェックの向きが変わる
export const browserSupportListState = definePageState('browser-support', {
  url: z.object({
    q: z._default(z.string(), ''),
    widely: z._default(z.string(), 'true'),
    newly: z._default(z.string(), 'true'),
    limited: z._default(z.string(), 'true'),
    recent: z._default(z.string(), 'false'),
    year: z._default(z.string(), ''),
  }),
});

export const readFlag = (value: string): boolean =>
  value.toLowerCase() === 'true';

export const readYear = (
  year: string,
  availableYears: readonly string[],
  defaultYear: string,
): string => (availableYears.includes(year) ? year : defaultYear);
