import { type AnyColumn, sql } from 'drizzle-orm';

export const increment = (column: AnyColumn, value = 1) =>
  sql`${column} + ${value}`;
