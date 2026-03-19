import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server';
import { DATE_RANGE_VALUES } from './constants';

export const readingListParsers = {
  q: parseAsString.withDefault(''),
  source: parseAsArrayOf(parseAsInteger).withDefault([]),
  date: parseAsStringLiteral(DATE_RANGE_VALUES).withDefault('all'),
};

export const readingListParamsCache =
  createSearchParamsCache(readingListParsers);
