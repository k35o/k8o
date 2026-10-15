import type { ThreadListItem } from './threads';

const isNewer = (thread: ThreadListItem, than: ThreadListItem): boolean =>
  Date.parse(thread.updatedAt) > Date.parse(than.updatedAt);

export const withTouchedThreads = (
  server: ThreadListItem[],
  touched: ThreadListItem[],
): ThreadListItem[] => {
  const latest = new Map<string, ThreadListItem>();
  for (const thread of [...server, ...touched]) {
    const known = latest.get(thread.id);
    if (known === undefined || isNewer(thread, known)) {
      latest.set(thread.id, thread);
    }
  }
  return [...latest.values()].toSorted(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
  );
};
