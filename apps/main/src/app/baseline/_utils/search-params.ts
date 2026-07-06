import { parseAsBoolean, parseAsString } from 'nuqs/server';

export const baselineListParsers = {
  q: parseAsString.withDefault(''),
  newly: parseAsBoolean.withDefault(true),
  widely: parseAsBoolean.withDefault(true),
  recent: parseAsBoolean.withDefault(false),
  year: parseAsString,
};
