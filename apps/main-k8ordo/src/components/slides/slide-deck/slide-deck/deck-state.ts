import { definePageState } from '@k8ordo/state';
import * as z from 'zod/mini';

export const slideDeckState = definePageState('slide-deck', {
  url: z.object({
    mode: z._default(z.enum(['viewer', 'presenter']), 'viewer'),
    session: z._default(z.string(), ''),
  }),
});
