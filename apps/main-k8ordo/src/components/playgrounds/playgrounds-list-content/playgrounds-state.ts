import { definePageState } from '@k8ordo/state';
import * as z from 'zod/mini';

export const playgroundsState = definePageState('playgrounds', {
  url: z.object({ q: z._default(z.string(), '') }),
});
