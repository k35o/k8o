import { parseAsString } from 'nuqs/server';

export const playgroundListParsers = {
  q: parseAsString.withDefault(''),
};
