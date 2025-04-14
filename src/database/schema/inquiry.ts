import {
  index,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const inquiry = pgTable(
  'inquiry',
  {
    id: serial('id').primaryKey(),
    message: text('message').notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .$onUpdate(() => new Date())
      .defaultNow(),
  },
  (table) => [index().on(table.id)],
);
