export type DateRange = 'today' | 'week' | 'month' | 'all';

export const DATE_RANGE_OPTIONS: readonly {
  value: DateRange;
  label: string;
}[] = [
  { value: 'all', label: 'すべての期間（3ヶ月）' },
  { value: 'today', label: '今日の記事' },
  { value: 'week', label: '1週間以内' },
  { value: 'month', label: '1ヶ月以内' },
];

export const DATE_RANGE_VALUES = [
  'today',
  'week',
  'month',
  'all',
] as const satisfies readonly DateRange[];

const DATE_RANGE_SET = new Set<string>(DATE_RANGE_VALUES);

export const isDateRange = (value: string): value is DateRange =>
  DATE_RANGE_SET.has(value);
