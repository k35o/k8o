import { createClient } from '@libsql/client/http';
import { drizzle } from 'drizzle-orm/libsql/http';

import { relations, schema } from './schema';

const authToken = process.env['AI_TURSO_AUTH_TOKEN'];

const client = createClient({
  url: process.env['AI_TURSO_DATABASE_URL'] ?? '',
  ...(authToken !== undefined && authToken !== '' ? { authToken } : {}),
});

const drizzleDb = drizzle(client, {
  schema: {
    ...schema,
    ...relations,
  },
});

export const db = Object.assign(drizzleDb, {
  _schema: schema,
});
