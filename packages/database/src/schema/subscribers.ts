import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

export const subscribers = sqliteTable(
  'subscribers',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').notNull(),
    isVerified: integer('is_verified', { mode: 'boolean' })
      .notNull()
      .default(false),
    verificationToken: text('verification_token'),
    tokenExpiresAt: text('token_expires_at'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
      .$onUpdate(() => new Date().toISOString()),
    deletedAt: text('deleted_at'),
  },
  (table) => [
    index('subscribers_id_idx').on(table.id),
    uniqueIndex('subscribers_email_idx').on(table.email),
  ],
);
