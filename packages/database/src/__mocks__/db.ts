import { type AnyColumn, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { relations, schema } from '../schema';

const drizzleDb = drizzle.mock({
  schema: {
    ...schema,
    ...relations,
  },
});

// db オブジェクトを拡張して、schema と utils も含める
export const db = Object.assign(drizzleDb, {
  _schema: schema,
  _utils: {
    increment: (column: AnyColumn, value = 1) => sql`${column} + ${value}`,
  },
});
