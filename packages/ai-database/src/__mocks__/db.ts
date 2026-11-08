import { drizzle } from 'drizzle-orm/libsql';

import { schema } from '../schema/index.ts';

const drizzleDb = drizzle.mock({ schema });

export const db = Object.assign(drizzleDb, {
  _schema: schema,
});
