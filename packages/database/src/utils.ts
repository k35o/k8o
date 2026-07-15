import { sql } from 'drizzle-orm';
import type { AnyColumn } from 'drizzle-orm';

export const increment = (column: AnyColumn, value = 1) =>
  sql`${column} + ${value}`;
