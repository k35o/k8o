import { drizzle } from 'drizzle-orm/libsql';

import { relations, schema } from '../schema';
import { increment } from '../utils';

const drizzleDb = drizzle.mock({
  schema: {
    ...schema,
    ...relations,
  },
});

export const db = Object.assign(drizzleDb, {
  _schema: schema,
  _utils: {
    increment,
  },
});
