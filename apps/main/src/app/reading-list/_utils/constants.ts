export const SORT_OPTIONS = [
  { value: 'newest', label: '新しい順' },
  { value: 'oldest', label: '古い順' },
] as const;

export type SortOrder = (typeof SORT_OPTIONS)[number]['value'];

export const SORT_VALUES = SORT_OPTIONS.map((o) => o.value);

const SORT_SET = new Set<string>(SORT_VALUES);

export const isSortOrder = (value: string): value is SortOrder =>
  SORT_SET.has(value);
