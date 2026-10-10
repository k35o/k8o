import { drizzle } from 'drizzle-orm/libsql';

import { relations, schema } from '../schema';

const drizzleDb = drizzle.mock({
  schema: {
    ...schema,
    ...relations,
  },
});

export const db = Object.assign(drizzleDb, {
  _schema: schema,
});
