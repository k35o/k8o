import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
} from 'nuqs/server';
import type { DateRange } from './constants';
import { isDateRange } from './constants';

const parseAsDateRange = parseAsString.withDefault('all' as DateRange);

export const readingListParsers = {
  q: parseAsString.withDefault(''),
  source: parseAsArrayOf(parseAsInteger).withDefault([]),
  date: parseAsDateRange,
};

export const readingListParamsCache =
  createSearchParamsCache(readingListParsers);

export const parseDateRange = (value: string): DateRange =>
  isDateRange(value) ? value : 'all';
