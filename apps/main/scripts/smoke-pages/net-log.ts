import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

import { z } from 'zod';

import { blockedCategoryOf } from './requests';
import type { BlockedCategory } from './requests';

export type LeakedRequest = {
  readonly category: BlockedCategory;
  readonly method: string;
  readonly url: string;
};

const constantsSchema = z.object({
  logEventPhase: z.object({ PHASE_BEGIN: z.number() }),
  logEventTypes: z.object({
    URL_REQUEST_START_JOB: z.number(),
    HTTP_TRANSACTION_SEND_REQUEST: z.number(),
  }),
});
const headerSchema = z.object({ constants: constantsSchema });
const eventSchema = z.object({
  type: z.number(),
  phase: z.number(),
  source: z.object({ id: z.number() }),
  params: z.record(z.string(), z.unknown()).optional(),
});
const startJobParamsSchema = z.object({ method: z.string(), url: z.string() });

const CONSTANTS_LINE = '{"constants":';
// イベントの行の末尾の区切りと、最後のイベントの行で閉じる配列の括弧を外す
const EVENT_LINE_END = /\]?,?$/u;

// context を閉じると、route で止めていた最中の要求も START_JOB を書いてから、送る前に
// 取り消される。外へ出たかは、送り始めた HTTP_TRANSACTION_SEND_REQUEST で見る
// （HTTP_TRANSACTION_SEND_REQUEST_HEADERS は HTTP/1.1 でしか書かれない）
export const findLeakedRequests = async (
  lines: AsyncIterable<string>,
): Promise<LeakedRequest[]> => {
  let constants: z.infer<typeof constantsSchema> | null = null;
  // redirect のたびに、同じ要求の START_JOB が新しい URL で書き直される
  const startedJobs = new Map<number, z.infer<typeof startJobParamsSchema>>();
  let sentRequests = 0;
  const leaked: LeakedRequest[] = [];
  for await (const line of lines) {
    if (line.startsWith(CONSTANTS_LINE)) {
      constants = headerSchema.parse(
        JSON.parse(`${line.replace(EVENT_LINE_END, '')}}`),
      ).constants;
      continue;
    }
    if (constants === null || !line.startsWith('{')) {
      continue;
    }
    const { type, phase, source, params } = eventSchema.parse(
      JSON.parse(line.replace(EVENT_LINE_END, '')),
    );
    const { logEventPhase, logEventTypes } = constants;
    if (type === logEventTypes.URL_REQUEST_START_JOB && params !== undefined) {
      startedJobs.set(source.id, startJobParamsSchema.parse(params));
      continue;
    }
    const job = startedJobs.get(source.id);
    if (
      type !== logEventTypes.HTTP_TRANSACTION_SEND_REQUEST ||
      phase !== logEventPhase.PHASE_BEGIN ||
      job === undefined
    ) {
      continue;
    }
    startedJobs.delete(source.id);
    sentRequests += 1;
    const category = blockedCategoryOf(job.method, job.url);
    if (category !== null) {
      leaked.push({ category, method: job.method, url: job.url });
    }
  }
  if (sentRequests === 0) {
    throw new Error(
      'netlog に要求を送った記録が1つも無い。Chromium の netlog の書き方と読み方が合っていない',
    );
  }
  return leaked;
};

export const readNetLogLines = (file: string): AsyncIterable<string> =>
  createInterface({ input: createReadStream(file), crlfDelay: Infinity });
