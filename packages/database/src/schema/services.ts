import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { serviceTag } from './service-tag';
import { serviceType } from './service-type';

export const services = sqliteTable(
  'services',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    type: integer('type')
      .notNull()
      .references(() => serviceType.id),
  },
  (table) => [
    uniqueIndex('services_slug_idx').on(table.slug),
    index('services_id_idx').on(table.id),
    index('services_type_idx').on(table.type),
  ],
);

export const servicesRelations = relations(services, ({ one, many }) => ({
  serviceTag: many(serviceTag),
  serviceType: one(serviceType),
}));
