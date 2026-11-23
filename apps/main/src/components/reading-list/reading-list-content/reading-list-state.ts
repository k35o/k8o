import { definePageState } from '@k8ordo/state';
import * as z from 'zod/mini';

export const readingListState = definePageState('reading-list', {
  url: z.object({ q: z._default(z.string(), '') }),
});
