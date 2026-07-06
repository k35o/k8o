import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server';

import { SORT_VALUES } from './constants';

export const readingListParsers = {
  q: parseAsString.withDefault(''),
  source: parseAsArrayOf(parseAsInteger).withDefault([]),
  sort: parseAsStringLiteral(SORT_VALUES).withDefault('newest'),
};
