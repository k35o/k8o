import { parseAsString } from 'nuqs/server';

export const blogListParsers = {
  q: parseAsString.withDefault(''),
};
