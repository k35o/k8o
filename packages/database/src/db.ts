import { createClient } from '@libsql/client/http';
import { type AnyColumn, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql/http';
import { relations, schema } from './schema';

const authToken = process.env['TURSO_AUTH_TOKEN'];

const client = createClient({
  url: process.env['TURSO_DATABASE_URL'] ?? '',
  ...(authToken && { authToken }),
});

const drizzleDb = drizzle(client, {
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
