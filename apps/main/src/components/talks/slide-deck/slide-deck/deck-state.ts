import { definePageState } from '@k8ordo/state';
import * as z from 'zod/mini';

// 表示する枚は fragment の #<番号>（1 始まり）。文字列のまま持ち、読むときに解く（理由は
// apps/main/CLAUDE.md の「ツールの URL の状態」）
export const slideDeckState = definePageState('slide-deck', {
  url: z.object({
    mode: z._default(z.enum(['viewer', 'presenter']), 'viewer'),
    session: z._default(z.string(), ''),
  }),
  hash: z._default(z.string(), ''),
});

const SLIDE_HASH = /^\d+$/u;

export const isSlideHash = (hash: string): boolean => SLIDE_HASH.test(hash);

// 番号でない fragment と 0 は 1 枚目
export const slideIndexOf = (hash: string): number =>
  isSlideHash(hash) ? Math.max(0, Number(hash) - 1) : 0;

export const slideHashOf = (index: number): string => (index + 1).toString();
