import { pgTable, serial, text, uniqueIndex } from 'drizzle-orm/pg-core';

export const quizType = pgTable(
  'quiz_type',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
  },
  (table) => [uniqueIndex().on(table.name)],
);
