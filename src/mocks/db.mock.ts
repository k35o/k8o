import { relations, schema } from '../database/schema';
import { drizzle } from 'drizzle-orm/neon-http';

export const db = drizzle.mock({
  schema: {
    ...schema,
    ...relations,
  },
});
