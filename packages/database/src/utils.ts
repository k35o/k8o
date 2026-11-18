import { sql } from 'drizzle-orm';
import type { AnyColumn, SQL } from 'drizzle-orm';

export const increment = (column: AnyColumn): SQL => sql`${column} + ${1}`;
