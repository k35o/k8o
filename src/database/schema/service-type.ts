import {
  pgTable,
  serial,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const serviceType = pgTable(
  'service_type',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
  },
  (table) => [uniqueIndex().on(table.name)],
);
