import { drizzle } from 'drizzle-orm/neon-http';
import { relations, schema } from '@/database/schema';

export const db = drizzle.mock({
  schema: {
    ...schema,
    ...relations,
  },
});
