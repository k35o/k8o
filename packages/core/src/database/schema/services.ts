import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  pgTable,
  serial,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { serviceTag } from './service-tag';
import { serviceType } from './service-type';

export const services = pgTable(
  'services',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    type: integer('type')
      .notNull()
      .references(() => serviceType.id),
  },
  (table) => [
    uniqueIndex().on(table.slug),
    index().on(table.id),
    index().on(table.type),
  ],
);

export const servicesRelations = relations(services, ({ one, many }) => ({
  serviceTag: many(serviceTag),
  serviceType: one(serviceType),
}));
