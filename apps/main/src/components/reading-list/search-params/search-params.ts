import { definePageState } from '@k8ordo/state';
import * as z from 'zod/mini';

import { SORT_VALUES } from '../constants/constants';

// source は文字列のまま持ち、読むときに解く。z.array は ?source=1&source=2 の繰り返しで読み書きし、
// 外に貼られた apps/main（nuqs）の ?source=1,2 を読めない
export const readingListState = definePageState('reading-list', {
  url: z.object({
    q: z._default(z.string(), ''),
    source: z._default(z.string(), ''),
    sort: z._default(z.enum(SORT_VALUES), 'newest'),
  }),
});

export const readSourceIds = (source: string): number[] =>
  source === ''
    ? []
    : source.split(',').flatMap((item) => {
        // oxlint-disable-next-line radix -- parseAsInteger と同じく radix を渡さず、0x10 を 16 と読む
        const id = Number.parseInt(item);
        return Number.isNaN(id) ? [] : [id];
      });
