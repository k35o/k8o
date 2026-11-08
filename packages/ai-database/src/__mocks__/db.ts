import { drizzle } from 'drizzle-orm/libsql';

import { relations, schema } from '../schema/index.ts';

const drizzleDb = drizzle.mock({
  schema: {
    ...schema,
    ...relations,
  },
});

export const db = Object.assign(drizzleDb, {
  _schema: schema,
});
