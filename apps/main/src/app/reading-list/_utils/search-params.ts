import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server';

import { DATE_RANGE_VALUES, SORT_VALUES } from './constants';

export const readingListParsers = {
  q: parseAsString.withDefault(''),
  source: parseAsArrayOf(parseAsInteger).withDefault([]),
  date: parseAsStringLiteral(DATE_RANGE_VALUES).withDefault('all'),
  sort: parseAsStringLiteral(SORT_VALUES).withDefault('newest'),
};
