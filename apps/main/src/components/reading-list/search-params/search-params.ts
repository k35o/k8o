import { definePageState } from '@k8ordo/state';
import * as z from 'zod/mini';

import { SORT_VALUES } from '../constants/constants';

// source は書くときと同じカンマ区切りの文字列で持ち、読むときに解く。z.array は ?source=1&source=2 の
// 繰り返しで読み書きし、カンマ区切りの URL を読めない
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
        const id = Number(item);
        return item === '' || !Number.isInteger(id) ? [] : [id];
      });
