import { services } from './services';
import { tags } from './tags';
import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  pgTable,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const serviceTag = pgTable(
  'service_tag',
  {
    serviceId: integer('service_id')
      .notNull()
      .references(() => services.id),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tags.id),
  },
  (table) => [
    index().on(table.serviceId),
    index().on(table.tagId),
    uniqueIndex().on(table.serviceId, table.tagId),
  ],
);

export const serviceTagRelations = relations(
  serviceTag,
  ({ one }) => ({
    service: one(services, {
      fields: [serviceTag.serviceId],
      references: [services.id],
    }),
    tag: one(tags, {
      fields: [serviceTag.tagId],
      references: [tags.id],
    }),
  }),
);
