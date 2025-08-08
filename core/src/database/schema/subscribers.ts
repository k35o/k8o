import {
  boolean,
  index,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const subscribers = pgTable(
  'subscribers',
  {
    id: serial('id').primaryKey(),
    email: text('email').notNull(),
    isVerified: boolean('is_verified').notNull().default(false),
    verificationToken: text('verification_token'),
    tokenExpiresAt: timestamp('token_expires_at', {
      withTimezone: true,
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .$onUpdate(() => new Date())
      .defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [index().on(table.id), uniqueIndex('email').on(table.email)],
);
