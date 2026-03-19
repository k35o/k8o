const DATE_RANGE_DEFINITIONS = [
  { value: 'all', label: 'すべての期間（3ヶ月）' },
  { value: 'today', label: '今日の記事' },
  { value: 'week', label: '1週間以内' },
  { value: 'month', label: '1ヶ月以内' },
] as const;

export type DateRange = (typeof DATE_RANGE_DEFINITIONS)[number]['value'];

export const DATE_RANGE_OPTIONS = DATE_RANGE_DEFINITIONS;

export const DATE_RANGE_VALUES = DATE_RANGE_DEFINITIONS.map((o) => o.value);

const DATE_RANGE_SET = new Set<string>(DATE_RANGE_VALUES);

export const isDateRange = (value: string): value is DateRange =>
  DATE_RANGE_SET.has(value);

const SORT_DEFINITIONS = [
  { value: 'newest', label: '新しい順' },
  { value: 'oldest', label: '古い順' },
] as const;

export type SortOrder = (typeof SORT_DEFINITIONS)[number]['value'];

export const SORT_OPTIONS = SORT_DEFINITIONS;

export const SORT_VALUES = SORT_DEFINITIONS.map((o) => o.value);
