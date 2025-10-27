import { drizzle } from 'drizzle-orm/neon-serverless';
import { relations, schema } from '@/database/schema';

export const db = drizzle.mock({
  schema: {
    ...schema,
    ...relations,
  },
});
