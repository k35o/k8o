import { relations, schema } from '../database/schema';
import { drizzle } from 'drizzle-orm/neon-http';

console.log('Mocking database connection');
export const db = drizzle.mock({
  schema: {
    ...schema,
    ...relations,
  },
});
