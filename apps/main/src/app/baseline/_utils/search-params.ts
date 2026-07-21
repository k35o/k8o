import { parseAsBoolean, parseAsString } from 'nuqs/server';

export const baselineListParsers = {
  q: parseAsString.withDefault(''),
  widely: parseAsBoolean.withDefault(true),
  newly: parseAsBoolean.withDefault(true),
  limited: parseAsBoolean.withDefault(true),
  recent: parseAsBoolean.withDefault(false),
  year: parseAsString,
};
